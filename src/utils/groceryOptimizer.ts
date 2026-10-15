import { MealPlanEntry, GroceryItem } from '../types';
import { SUPERMARKET_CATALOG } from '../data/supermarketCatalog';
import { findVerifiedStaple, VERIFIED_STAPLES_MAP } from './pricingEngine';

export interface OptimizationResult {
  costcoItems: GroceryItem[];
  hebItems: GroceryItem[];
  allGroceryItems: GroceryItem[];
  perishableItems: GroceryItem[];
  bulkPantryItems: GroceryItem[];
  totalCostMxn: number;
  costcoSubtotalMxn: number;
  hebSubtotalMxn: number;
  allHebAlternativeTotalMxn: number;
  estimatedSavingsMxn: number;
  savingsPercentage: number;
  totalProteinGramsInCart: number;
  costPerGramProteinMxn: number;
  timeframeMultiplier: number;
  selectedDaysCount: number;
  totalMealsCookedCount: number;
}

const DAY_NAMES_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export function generateOptimizedGroceryList(
  meals: MealPlanEntry[],
  preferredStore: 'all' | 'costco' | 'heb' = 'all',
  timeframeMultiplier: number = 1, // 1 = 1 Semana, 2 = 1 Quincena, 4 = 1 Mes
  selectedDays: string[] = DAY_NAMES_ORDER
): OptimizationResult {
  // 1. Filter meals to only those that match selectedDays
  const activeMeals = meals.filter(entry => {
    // If dish has assignedDay, match directly
    if (entry.dish.assignedDay) {
      return selectedDays.includes(entry.dish.assignedDay);
    }
    // Otherwise map dayOfWeek (0=Domingo, 1=Lunes, 2=Martes...)
    const dayName = entry.dayOfWeek === 0 ? 'Domingo' : DAY_NAMES_ORDER[entry.dayOfWeek - 1] || 'Lunes';
    return selectedDays.includes(dayName);
  });

  // 2. Accumulate ingredient demands across filtered meals
  const ingredientTotals: Record<string, { totalAmountG: number; preferredStore?: string; isPerishable: boolean }> = {};

  activeMeals.forEach(entry => {
    const servings = entry.servings || 1;
    entry.dish.ingredients.forEach(ing => {
      const normalizedName = ing.name.trim();
      let weightG = ing.amount;
      if (ing.unit === 'ml') weightG = ing.amount;
      if (ing.unit === 'pza') weightG = ing.amount * 50;
      if (ing.unit === 'taza') weightG = ing.amount * 240;
      if (ing.unit === 'cda') weightG = ing.amount * 15;

      const totalIngWeight = weightG * servings * timeframeMultiplier;
      const verified = findVerifiedStaple(normalizedName);
      const isPerishable = verified ? verified.isPerishable : (!normalizedName.toLowerCase().includes('avena') && !normalizedName.toLowerCase().includes('arroz') && !normalizedName.toLowerCase().includes('proteina') && !normalizedName.toLowerCase().includes('atun'));

      if (!ingredientTotals[normalizedName]) {
        ingredientTotals[normalizedName] = {
          totalAmountG: 0,
          preferredStore: ing.preferredStore,
          isPerishable
        };
      }
      ingredientTotals[normalizedName].totalAmountG += totalIngWeight;
    });
  });

  const groceryItems: GroceryItem[] = [];

  // 3. Match each ingredient to best store or catalog item
  Object.entries(ingredientTotals).forEach(([ingName, info], index) => {
    const searchLower = ingName.toLowerCase();
    const verified = findVerifiedStaple(ingName);
    
    // Find closest matches in catalog
    const matchingProducts = SUPERMARKET_CATALOG.filter(p => {
      const pName = p.name.toLowerCase();
      const pBrand = p.brand.toLowerCase();
      return (
        searchLower.split(' ').some(word => word.length > 3 && pName.includes(word)) ||
        pName.includes(searchLower) ||
        searchLower.includes(pName.slice(0, 8))
      );
    });

    const costcoMatch = matchingProducts.find(p => p.store === 'costco');
    const hebMatch = matchingProducts.find(p => p.store === 'heb');

    let recommendedStore: 'costco' | 'heb' = 'heb';
    let reason = 'Compra de consumo inmediato o vegetal fresco';
    let estPrice = 45.00;
    let costPer100g = 15.00;
    let altPrice = 60.00;
    let altStore: 'costco' | 'heb' = 'costco';
    let pkgDesc = `${info.totalAmountG}g porción estimada`;
    let isPerishable = info.isPerishable;
    let shelfLife = verified ? verified.shelfLifeDays : 7;

    // Decision rule for bulk Costco vs Fresh H-E-B:
    // Bulk in Costco is recommended if:
    // - Item is non-perishable (oats, whey, rice, tuna cans, frozen chicken packs)
    // - OR high usage volume
    const isPantryStaple = searchLower.includes('avena') || searchLower.includes('arroz') || searchLower.includes('cacahuate') || searchLower.includes('aceite') || searchLower.includes('proteína') || searchLower.includes('atún') || searchLower.includes('quinoa');
    const isBulkProtein = (searchLower.includes('pollo') || searchLower.includes('salmón') || searchLower.includes('clara') || searchLower.includes('huevo')) && info.totalAmountG >= 500;

    if (preferredStore === 'costco') {
      recommendedStore = costcoMatch ? 'costco' : 'heb';
    } else if (preferredStore === 'heb') {
      recommendedStore = 'heb';
    } else {
      if ((isPantryStaple || isBulkProtein) && costcoMatch) {
        recommendedStore = 'costco';
        reason = `📦 Ahorro mayoreo en Costco (${costcoMatch.brand} rinde múltiples semanas al menor costo por kilo)`;
      } else {
        recommendedStore = 'heb';
        reason = '🥬 Frescura garantizada en H-E-B para consumo semanal sin merma ni desperdicio';
      }
    }

    if (recommendedStore === 'costco' && costcoMatch) {
      // Calculate how many packages needed
      const pkgsNeeded = Math.max(1, Math.ceil(info.totalAmountG / (costcoMatch.packageWeightG || 1000)));
      estPrice = costcoMatch.priceMxn * pkgsNeeded;
      costPer100g = (costcoMatch.unitPricePerKgMxn / 10);
      pkgDesc = `${pkgsNeeded > 1 ? `${pkgsNeeded}x ` : ''}${costcoMatch.packageDescription}`;
      altStore = 'heb';
      if (hebMatch) {
        altPrice = Math.round((costcoMatch.packageWeightG * pkgsNeeded / 1000) * hebMatch.unitPricePerKgMxn);
      } else {
        altPrice = Math.round(estPrice * 1.30);
      }
    } else if (hebMatch) {
      const neededKg = info.totalAmountG / 1000;
      estPrice = Math.max(20, Math.round(neededKg * hebMatch.unitPricePerKgMxn));
      costPer100g = (hebMatch.unitPricePerKgMxn / 10);
      pkgDesc = `${Math.round(info.totalAmountG)}g (${hebMatch.packageDescription})`;
      altStore = 'costco';
      altPrice = costcoMatch ? costcoMatch.priceMxn : Math.round(estPrice * 1.25);
    } else if (verified) {
      const neededKg = info.totalAmountG / 1000;
      if (recommendedStore === 'costco' && verified.stores.costco) {
        estPrice = Math.round(Math.max(verified.stores.costco.priceMxn, neededKg * verified.stores.costco.unitPricePerKgMxn));
        costPer100g = verified.stores.costco.unitPricePerKgMxn / 10;
        pkgDesc = verified.stores.costco.packageName;
        altPrice = verified.stores.heb ? Math.round(neededKg * verified.stores.heb.unitPricePerKgMxn) : Math.round(estPrice * 1.3);
      } else {
        estPrice = Math.max(15, Math.round(neededKg * verified.stores.heb.unitPricePerKgMxn));
        costPer100g = verified.stores.heb.unitPricePerKgMxn / 10;
        pkgDesc = verified.stores.heb.packageName;
        altPrice = verified.stores.costco ? verified.stores.costco.priceMxn : Math.round(estPrice * 1.25);
      }
    } else {
      // Fallback calculation
      const neededG = info.totalAmountG;
      if (searchLower.includes('pollo')) {
        estPrice = recommendedStore === 'costco' ? 329 : Math.round((neededG / 1000) * 165);
        pkgDesc = recommendedStore === 'costco' ? 'Bolsa 2.5kg al vacío' : `${Math.round(neededG)}g frescos`;
      } else if (searchLower.includes('clara') || searchLower.includes('huevo')) {
        estPrice = recommendedStore === 'costco' ? 198 : 62;
        pkgDesc = recommendedStore === 'costco' ? 'Pack 4x1kg' : 'Botella 1L';
      } else {
        estPrice = Math.max(15, Math.round((neededG / 1000) * 45));
        pkgDesc = `${Math.round(neededG)}g porción estimada`;
      }
      costPer100g = 4.5;
      altPrice = Math.round(estPrice * 1.25);
    }

    const savings = Math.max(0, altPrice - estPrice);

    groceryItems.push({
      id: `grocery-${index}-${ingName}`,
      name: ingName,
      category: searchLower.includes('pollo') || searchLower.includes('clara') || searchLower.includes('huevo') || searchLower.includes('carne') || searchLower.includes('atun') || searchLower.includes('pescado') || searchLower.includes('pavo') || searchLower.includes('salmon') ? 'Proteínas' : searchLower.includes('avena') || searchLower.includes('arroz') || searchLower.includes('tortilla') || searchLower.includes('quinoa') || searchLower.includes('papa') || searchLower.includes('camote') ? 'Carbohidratos' : searchLower.includes('aguacate') || searchLower.includes('aceite') || searchLower.includes('cacahuate') ? 'Grasas Saludables' : 'Frescos y Verduras',
      recommendedStore,
      reason,
      neededWeightG: Math.round(info.totalAmountG),
      packageDescription: pkgDesc,
      estimatedPriceMxn: estPrice,
      costPer100gMxn: parseFloat(costPer100g.toFixed(2)),
      alternativeStore: altStore,
      alternativePriceMxn: altPrice,
      savingsMxn: savings > 5 ? savings : undefined,
      isChecked: false,
      isPerishable,
      shelfLifeDays: shelfLife
    });
  });

  const costcoItems = groceryItems.filter(item => item.recommendedStore === 'costco');
  const hebItems = groceryItems.filter(item => item.recommendedStore === 'heb');
  const perishableItems = groceryItems.filter(item => item.isPerishable);
  const bulkPantryItems = groceryItems.filter(item => !item.isPerishable);

  const costcoSubtotalMxn = costcoItems.reduce((sum, item) => sum + item.estimatedPriceMxn, 0);
  const hebSubtotalMxn = hebItems.reduce((sum, item) => sum + item.estimatedPriceMxn, 0);
  const totalCostMxn = costcoSubtotalMxn + hebSubtotalMxn;

  const allHebAlternativeTotalMxn = groceryItems.reduce((sum, item) => {
    if (item.recommendedStore === 'costco' && item.alternativePriceMxn) {
      return sum + item.alternativePriceMxn;
    }
    return sum + item.estimatedPriceMxn;
  }, 0);

  const estimatedSavingsMxn = Math.max(0, allHebAlternativeTotalMxn - totalCostMxn);
  const savingsPercentage = allHebAlternativeTotalMxn > 0 
    ? Math.round((estimatedSavingsMxn / allHebAlternativeTotalMxn) * 100) 
    : 0;

  // Approximate protein in cart
  const totalProteinGramsInCart = activeMeals.reduce((sum, m) => sum + (m.dish.proteinG * (m.servings || 1)), 0) * timeframeMultiplier;
  const costPerGramProteinMxn = totalProteinGramsInCart > 0 
    ? parseFloat((totalCostMxn / totalProteinGramsInCart).toFixed(2)) 
    : 0;

  return {
    costcoItems,
    hebItems,
    allGroceryItems: groceryItems,
    perishableItems,
    bulkPantryItems,
    totalCostMxn,
    costcoSubtotalMxn,
    hebSubtotalMxn,
    allHebAlternativeTotalMxn,
    estimatedSavingsMxn,
    savingsPercentage,
    totalProteinGramsInCart,
    costPerGramProteinMxn,
    timeframeMultiplier,
    selectedDaysCount: selectedDays.length,
    totalMealsCookedCount: activeMeals.length * timeframeMultiplier
  };
}
