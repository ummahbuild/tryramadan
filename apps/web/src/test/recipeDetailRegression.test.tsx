import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import RecipeDetail from '@/pages/RecipeDetail';
import recipes from '@/data/recipes.json';

vi.mock('@/components/Navbar', () => ({ Navbar: (): null => null }));
vi.mock('@/components/Footer', () => ({ Footer: (): null => null }));

function show(path: string) {
  return render(<MemoryRouter initialEntries={[path]}>
    <Link to={`/recipe/suhoor/${recipes.suhoor[1].id}`}>Next recipe</Link>
    <Routes><Route path="/recipe/:mealType/:id" element={<RecipeDetail />} /></Routes>
  </MemoryRouter>);
}

// Reproduction and release gate: docs/DEVELOPMENT-PLAN.md, BUG-NAV-002.
describe('Regression: BUG-NAV-002 (invalid recipe URLs)', () => {
  it.each(['breakfast/1', 'suhoor/1junk', 'suhoor/1.5', 'suhoor/-1', 'iftar/999999', 'suhoor/9007199254740992'])(
    'BUG-NAV-002.1: %s shows not found without crashing', (path) => {
      show(`/recipe/${path}`);
      expect(screen.getByRole('heading', { name: 'Recipe not found' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Browse all recipes/ })).toHaveAttribute('href', '/recipes');
    }
  );
  it.each(['suhoor', 'iftar'] as const)('BUG-NAV-002.2: valid %s recipe renders', (type) => {
    const recipe = recipes[type][0];
    show(`/recipe/${type}/${recipe.id}`);
    expect(screen.getByRole('heading', { name: recipe.name, level: 1 })).toBeInTheDocument();
  });
});

describe('Regression: BUG-MEAL-001 (servings leak across recipe navigation)', () => {
  it('BUG-MEAL-001.1: next recipe starts at its own default servings', () => {
    show(`/recipe/suhoor/${recipes.suhoor[0].id}`);
    fireEvent.change(screen.getByRole('combobox', { name: 'Number of servings' }), { target: { value: '12' } });
    fireEvent.click(screen.getByRole('link', { name: 'Next recipe' }));
    expect(screen.getByRole('combobox', { name: 'Number of servings' }))
      .toHaveValue(String(recipes.suhoor[1].defaultServings ?? 4));
  });
});
