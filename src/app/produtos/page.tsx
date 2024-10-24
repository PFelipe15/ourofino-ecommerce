"use client";
import { useState, useEffect, useCallback } from "react";
import ProductCard from "@/components/layout/store/Product-Card/ProductCard";
import { FaChevronRight, FaFilter } from "react-icons/fa";
import { useSearchParams, useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { getProductsByFilter } from "@/_actions/Products";
import { getFavoriteProducts } from "@/_actions/handleFavoriteProduct";
import { useUser } from '@clerk/clerk-react'
import { ProductsData } from "../../../types/product-all-strape";
import { getCategoryByName, getCollectionByName } from "@/_actions/Categories";

const ProductListingPage = () => {
  const [productsList, setProductsList] = useState<ProductsData[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();

  const getFiltersFromURL = useCallback(() => {
    return {
      selectedSizes: searchParams.get('sizes')?.split(',') || [],
      selectedMaterials: searchParams.get('materials')?.split(',') || [],
      sortOption: searchParams.get('sort') || "Mais Vendidos",
      minPrice: searchParams.get('minPrice') || "",
      maxPrice: searchParams.get('maxPrice') || "",
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(getFiltersFromURL());

  const updateURL = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams(searchParams);
    if (newFilters.selectedSizes.length) params.set('sizes', newFilters.selectedSizes.join(','));
    else params.delete('sizes');
    if (newFilters.selectedMaterials.length) params.set('materials', newFilters.selectedMaterials.join(','));
    else params.delete('materials');
    if (newFilters.sortOption !== "Mais Vendidos") params.set('sort', newFilters.sortOption);
    else params.delete('sort');
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString());
    else params.delete('minPrice');
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString());
    else params.delete('maxPrice');
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchParams, router]);

  const buildFilterString = useCallback(() => {
    const filterParts = [];
    const { selectedSizes, selectedMaterials, minPrice, maxPrice, sortOption } = filters;

    if (selectedSizes.length > 0) {
      filterParts.push(selectedSizes.map(size => 
        `filters[variants_price][variantes][tamanhos_estoque][tamanho][$eq]=${size}`
      ).join('&'));
    }

    if (selectedMaterials.length > 0) {
      filterParts.push(selectedMaterials.map(material => 
        `filters[material][$eq]=${encodeURIComponent(material)}`
      ).join('&'));
    }

    if (minPrice) filterParts.push(`filters[price_primary][$gte]=${minPrice}`);
    if (maxPrice) filterParts.push(`filters[price_primary][$lte]=${maxPrice}`);

    if (sortOption === "price_asc") filterParts.push("sort=price_primary:asc");
    else if (sortOption === "price_desc") filterParts.push("sort=price_primary:desc");

    return filterParts.join('&');
  }, [filters]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const categoria = searchParams.get("categoria");
        const colecao = searchParams.get("colecao");
        let filterString = buildFilterString();

        if (categoria && colecao) {
          const categoryData = await getCategoryByName(categoria);
          const collectionData = await getCollectionByName(colecao);
          if (categoryData && collectionData) {
            filterString += `&filters[collection][id][$eq]=${collectionData.id}`;
          }
        } else if (categoria) {
          const categoryData = await getCategoryByName(categoria);
          if (categoryData) {
            filterString += `&filters[collection][categoria][id][$eq]=${categoryData.id}`;
          }
        } else if (colecao) {
          const collectionData = await getCollectionByName(colecao);
          if (collectionData) {
            filterString += `&filters[collection][id][$eq]=${collectionData.id}`;
          }
        }

        if (searchParams.get("favoritos") === 'true' && user) {
          const favoriteProducts = await getFavoriteProducts(user?.emailAddresses[0]?.emailAddress);
          setProductsList(favoriteProducts);
        } else {
          const products = await getProductsByFilter(filterString);
          setProductsList(products);
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, user, filters, buildFilterString]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    updateURL(updatedFilters);
  };

  const handleSizeChange = (size: string) => {
    setFilters((prev) =>
      prev.selectedSizes.includes(size) ? { ...prev, selectedSizes: prev.selectedSizes.filter((s) => s !== size) } : { ...prev, selectedSizes: [...prev.selectedSizes, size] }
    );
  };

  const handleMaterialChange = (material: string) => {
    setFilters((prev) =>
      prev.selectedMaterials.includes(material) ? { ...prev, selectedMaterials: prev.selectedMaterials.filter((m) => m !== material) } : { ...prev, selectedMaterials: [...prev.selectedMaterials, material] }
    );
  };

  const handlePriceFilter = () => {
    console.log(`Filtrar produtos de R$${filters.minPrice} até R$${filters.maxPrice}`);
  };

  const handleSortChange = (option: string) => {
    setFilters((prev) => ({ ...prev, sortOption: option }));
    const currentParams = new URLSearchParams(searchParams.toString());
    
    // Atualiza ou remove o parâmetro 'sort'
    if (option === "price_asc" || option === "price_desc") {
      currentParams.set('sort', option);
    } else {
      currentParams.delete('sort');
    }

    // Atualiza o parâmetro 'favoritos'
    if (option === "favorites") {
      currentParams.set('favoritos', 'true');
    } else {
      currentParams.delete('favoritos');
    }

    // Mantém os parâmetros existentes e adiciona/atualiza os novos
    router.push(`?${currentParams.toString()}`, { scroll: false });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-1/4 bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Filtros</h2>
            <Button variant="outline" size="sm">
              <FaFilter className="mr-2" /> Limpar
            </Button>
          </div>

          {/* Filtro de Preço */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-700">Preço</h3>
            <Slider
              min={0}
              max={5000}
              step={100}
              value={[filters.minPrice || 0, filters.maxPrice || 5000]}
              onValueChange={([min, max]) => {
                setFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }));
              }}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>R$ {filters.minPrice || 0}</span>
              <span>R$ {filters.maxPrice || 5000}</span>
            </div>
          </div>

          {/* Filtro de Tamanho */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-700">Tamanho</h3>
            <div className="grid grid-cols-4 gap-2">
              {["9", "10", "11", "12", "13", "14", "15", "16"].map((size) => (
                <Button
                  key={size}
                  variant={filters.selectedSizes.includes(size) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSizeChange(size)}
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>

          {/* Filtro de Materiais */}
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-gray-700">Materiais</h3>
            <div className="space-y-2">
              {["Prata", "Ouro"].map((material) => (
                <label key={material} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2 h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                    onChange={() => handleMaterialChange(material)}
                    checked={filters.selectedMaterials.includes(material)}
                  />
                  <span className="text-gray-700">{material}</span>
                </label>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={handlePriceFilter}>
            Aplicar Filtros
          </Button>
        </aside>

        <main className="w-full md:w-3/4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
            <Select onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="favorites">Favoritos</SelectItem>
                <SelectItem value="price_asc">Menor Preço</SelectItem>
                <SelectItem value="price_desc">Maior Preço</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="aspect-square w-full bg-gray-300 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            ) : (
              productsList?.map((product, index) => (
                <ProductCard key={index} product={product} />
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductListingPage;
