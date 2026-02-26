import React from "react";

export default function RecipeCard({ recipe, variant = "default" }) {
  // Handle different recipe data structures
  const getRecipeData = () => {
    // For MealDB recipes (category/cuisine pages)
    if (recipe.strMeal) {
      return {
        title: recipe.strMeal,
        image: recipe.strMealThumb,
        href: `/recipe?cook=${encodeURIComponent(recipe.strMeal)}`,
        showImage: true,
      };
    }

    // more conditions

    
  return {};
  };
  return <div>RecipeCard</div>;
};