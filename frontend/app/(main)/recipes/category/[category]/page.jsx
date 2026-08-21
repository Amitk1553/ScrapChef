"use client";

import { useParams } from "next/navigation"; //useParams hook allows us to access the dynamic route parameters, in this case, the category of recipes.
import RecipeGrid from "@/components/RecipeGrid";
import { getMealsByCategory } from "@/actions/mealdb.actions";

export default function CategoryRecipesPage() {
  const params = useParams();
  const category = params.category;

  return (
    <RecipeGrid
      type="category"
      value={category}
      fetchAction={getMealsByCategory}
      backLink="/dashboard"
    />
  );
}