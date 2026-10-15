import { MealPlanEntry, GroceryItem, SupermarketProduct } from '../types';
import { SUPERMARKET_CATALOG } from '../data/supermarketCatalog';

export interface OptimizationResult {
  costcoItems: GroceryItem[];
  hebItems: GroceryItem[];
  allGroceryItems: GroceryItem[];
  totalCostMxn: number;
  costcoSubtotalMxn: number;
  hebSubtotalMxn: number;
  allHebAlternativeTotalMxn: number;
  estimatedSavingsMxn: number;
  savingsPercentage: number;
  totalProteinGramsInCart: number;
  costPerGramProteinMxn: number;
}

export function generateOptimizedGroceryList(
  meals: MealPlanEntry[],
  preferredStore: 'all' | 'costco' | 'heb' = 'all'
): OptimizationResult {
  // 1. Accumulate all ingredient demands across selected meals
  const ingredientTotals: Record<string, { totalAmountG: number; preferredStore?: string }> = {};

  meals.forEach(entry => {
    const servings = entry.servings || 1;
    entry.dish.ingredients.forEach(ing => {
      const normalizedName = ing.name.trim();
      let weightG = ing.amount;
      // Basic unit conversion
      if (ing.unit === 'ml') weightG = ing.amount; // roughly 1g/ml
      if (ing.unit === 'pza') weightG = ing.amount * 50; // default piece weight
      if (ing.unit === 'taza') weightG = ing.amount * 240;
      if (ing.unit === 'cda') weightG = ing.amount * 15;

      const totalIngWeight = weightG * servings;

      if (!ingredientTotals[normalizedName]) {
        ingredientTotals[normalizedName] = {
          totalAmountG: 0,
          preferredStore: ing.preferredStore
        };
      }
      ingredientTotals[normalizedName].totalAmountG += totalIngWeight;
    });
  });

  const groceryItems: GroceryItem[] = [];

  // 2. Match each ingredient to best store or catalog item
  Object.entries(ingredientTotals).forEach(([ingName, info], index) => {
    const searchLower = ingName.toLowerCase();
    
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

    // Decision rule for bulk Costco vs Fresh H-E-B:
    // Bulk in Costco is recommended if:
    // - Item is non-perishable (oats, peanut butter, whey, olive oil, rice)
    // - OR high usage volume (> 600g of chicken or egg whites or beef)
    // - OR preferredStore is 'costco'
    const isHighVolumeProtein = (searchLower.includes('pollo') || searchLower.includes('clara') || searchLower.includes('huevo') || searchLower.includes('carne') || searchLower.includes('atún')) && info.totalAmountG >= 400;
    const isPantryStaple = searchLower.includes('avena') || searchLower.includes('arroz') || searchLower.includes('cacahuate') || searchLower.includes('aceite') || searchLower.includes('berries') || searchLower.includes('proteína') || searchLower.includes('yogurt');

    if (preferredStore === 'costco') {
      recommendedStore = costcoMatch ? 'costco' : 'heb';
    } else if (preferredStore === 'heb') {
      recommendedStore = 'heb';
    } else {
      if ((isHighVolumeProtein || isPantryStaple) && costcoMatch) {
        recommendedStore = 'costco';
        reason = `Ahorro mayoreo por volumen (${costcoMatch.brand} rinde múltiples comidas a menor costo por kg)`;
      } else {
        recommendedStore = 'heb';
        reason = 'Frescura óptima, porción justa y cero desperdicio';
      }
    }

    if (recommendedStore === 'costco' && costcoMatch) {
      estPrice = costcoMatch.priceMxn;
      costPer100g = (costcoMatch.unitPricePerKgMxn / 10);
      pkgDesc = costcoMatch.packageDescription;
      altStore = 'heb';
      if (hebMatch) {
        // Equivalent cost in HEB for that amount
        altPrice = Math.round((costcoMatch.packageWeightG / 1000) * hebMatch.unitPricePerKgMxn);
      } else {
        altPrice = Math.round(estPrice * 1.35); // retail is typically ~35% more expensive per kg
      }
    } else if (hebMatch) {
      estPrice = hebMatch.priceMxn;
      costPer100g = (hebMatch.unitPricePerKgMxn / 10);
      pkgDesc = hebMatch.packageDescription;
      altStore = 'costco';
      altPrice = costcoMatch ? costcoMatch.priceMxn : Math.round(estPrice * 1.2);
    } else {
      // Fallback calculation
      if (searchLower.includes('pollo')) {
        estPrice = recommendedStore === 'costco' ? 329 : 148;
        pkgDesc = recommendedStore === 'costco' ? 'Bolsa 2.5kg al vacío' : 'Charola fresca 900g';
      } else if (searchLower.includes('clara') || searchLower.includes('huevo')) {
        estPrice = recommendedStore === 'costco' ? 198 : 62;
        pkgDesc = recommendedStore === 'costco' ? 'Pack 4x1kg' : 'Botella 1L';
      } else if (searchLower.includes('aguacate') || searchLower.includes('espinaca') || searchLower.includes('jitomate')) {
        recommendedStore = 'heb';
        estPrice = 38.00;
        pkgDesc = 'Porción fresca seleccionada';
      }
    }

    const savings = Math.max(0, altPrice - estPrice);

    groceryItems.push({
      id: `grocery-${index}-${ingName}`,
      name: ingName,
      category: searchLower.includes('pollo') || searchLower.includes('clara') || searchLower.includes('carne') || searchLower.includes('atun') ? 'Proteínas' : searchLower.includes('avena') || searchLower.includes('arroz') || searchLower.includes('tortilla') ? 'Carbohidratos' : 'Frescos y Grasas',
      recommendedStore,
      reason,
      neededWeightG: Math.round(info.totalAmountG),
      packageDescription: pkgDesc,
      estimatedPriceMxn: estPrice,
      costPer100gMxn: parseFloat(costPer100g.toFixed(2)),
      alternativeStore: altStore,
      alternativePriceMxn: altPrice,
      savingsMxn: savings > 5 ? savings : undefined,
      isChecked: false
    });
  });

  const costcoItems = groceryItems.filter(item => item.recommendedStore === 'costco');
  const hebItems = groceryItems.filter(item => item.recommendedStore === 'heb');

  const costcoSubtotalMxn = costcoItems.reduce((sum, item) => sum + item.estimatedPriceMxn, 0);
  const hebSubtotalMxn = hebItems.reduce((sum, item) => sum + item.estimatedPriceMxn, 0);
  const totalCostMxn = costcoSubtotalMxn + hebSubtotalMxn;

  // Calculate baseline cost if everything were bought individually at standard supermarket
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

  // Calculate protein density in basket
  const totalProteinGramsInCart = meals.reduce(
    (sum, m) => sum + (m.dish.proteinG * (m.servings || 1)), 
    0
  );
  const costPerGramProteinMxn = totalProteinGramsInCart > 0 
    ? parseFloat((totalCostMxn / totalProteinGramsInCart).toFixed(2)) 
    : 0;

  return {
    costcoItems,
    hebItems,
    allGroceryItems: groceryItems,
    totalCostMxn,
    costcoSubtotalMxn,
    hebSubtotalMxn,
    allHebAlternativeTotalMxn,
    estimatedSavingsMxn,
    savingsPercentage,
    totalProteinGramsInCart: Math.round(totalProteinGramsInCart),
    costPerGramProteinMxn
  };
}
