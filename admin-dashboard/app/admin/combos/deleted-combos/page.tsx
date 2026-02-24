"use client";

import { DialogDescription } from "@/components/ui/dialog";
import { DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { DialogContent } from "@/components/ui/dialog";
import { Dialog } from "@/components/ui/dialog";
import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Star,
  Package,
  Gift,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ComboImages } from "../components/combo-images";
import Link from "next/link";
import { customFetch } from "@/utils/customFetch";
import DeleteConfirmationModal from "@/components/shared/DeleteConfirmationModal";
import { Pagination } from "@/app/types/pagination";
import PaginationComponent from "@/components/shared/Pagination";

interface ComboProduct {
  productId: {
    _id: string;
    title: string;
    price: number;
    images: string[];
  };
  quantity: number;
}

interface Combo {
  _id: string;
  slug: string;
  name: string;
  description: string;
  products: ComboProduct[];
  originalPrice: number;
  comboPrice: number;
  images: string[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  status: "out_of_stock" | "in_stock";
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
}

interface Product {
  _id: string;
  title: string;
}

export default function CombosAdminPage() {
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalDocs: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [imagesDialogOpen, setImagesDialogOpen] = useState(false);
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null);

  const { toast } = useToast();

  // Fetch combos
  const fetchCombos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(featuredFilter !== "all" && { isFeatured: featuredFilter }),
        ...(productFilter !== "all" && { productId: productFilter }),
      });

      const response = await customFetch.get(`/combos/deleted?${params}`);
      const data = await response.data;

      if (data.success) {
        setCombos(data.combos);
        setPagination(data.pagination);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch combos",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch combos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, [currentPage, searchTerm, statusFilter, featuredFilter, productFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await customFetch.get(`/products/for-filter`);
      const data = await response.data;

      if (data.success) {
        setProducts(data.products);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Delete combo (soft delete)
  const restoreCombo = async (comboId: string) => {
    try {
      const response = await customFetch.put(`/combos/${comboId}/restore`);
      const data = await response.data;

      if (data.success) {
        toast({
          title: "Success",
          description: "Combo restored successfully",
        });
        fetchCombos();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete combo",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete combo",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCombos();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setFeaturedFilter("all");
    setProductFilter("all");
    setCurrentPage(1);
  };

  const calculateSavingsPercentage = (
    originalPrice: number,
    comboPrice: number
  ) => {
    return Math.round(((originalPrice - comboPrice) / originalPrice) * 100);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-destructive">Deleted</span> Combo Management
          </h1>
          <p className="text-muted-foreground">
            Manage your deleted product combo bundles and deals
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/combos">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Combos
            </Button>
          </Link>
          <Link href="/admin/combos/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Combo
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search combos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Featured" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Combos</SelectItem>
                  <SelectItem value="true">Featured Only</SelectItem>
                  <SelectItem value="false">Non-Featured</SelectItem>
                </SelectContent>
              </Select>

              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Contains Product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Apply Filters
                </Button>
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Combos Table */}
      <Card>
        <CardHeader>
          <CardTitle>Deleted Combos ({pagination.totalDocs})</CardTitle>
          <CardDescription>
            Showing {combos.length} of {pagination.totalDocs} combos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Combo</TableHead>
                      <TableHead>Products</TableHead>
                      <TableHead>Pricing & Savings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {combos.map((combo) => (
                      <TableRow key={combo._id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium flex items-center gap-2">
                              <Gift className="w-4 h-4 text-blue-500" />
                              {combo.name}
                              {combo.isFeatured && (
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline">
                              {combo.products.length} items
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {combo.products.slice(0, 2).map((item, index) => (
                              <div key={index}>
                                {item.productId.title} ({item.quantity}x)
                              </div>
                            ))}
                            {combo.products.length > 2 && (
                              <div>+{combo.products.length - 2} more...</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium text-green-600">
                              ₹{combo.comboPrice}
                            </div>
                            <div className="text-sm text-muted-foreground line-through">
                              ₹{combo.originalPrice}
                            </div>
                            <div className="text-xs text-green-600">
                              Save ₹{combo.originalPrice - combo.comboPrice} (
                              {calculateSavingsPercentage(
                                combo.originalPrice,
                                combo.comboPrice
                              )}
                              %)
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              combo.status === "in_stock"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {combo.status === "in_stock"
                              ? "In Stock"
                              : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {combo.tags.slice(0, 2).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {combo.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{combo.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <DeleteConfirmationModal
                              item={combo}
                              handleDelete={restoreCombo}
                              type="restore"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <PaginationComponent
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Combo Images Dialog */}
      <Dialog open={imagesDialogOpen} onOpenChange={setImagesDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Combo Images</DialogTitle>
            <DialogDescription>Manage combo images</DialogDescription>
          </DialogHeader>
          {selectedCombo && (
            <ComboImages
              combo={selectedCombo}
              onUpdate={() => {
                fetchCombos();
                toast({
                  title: "Success",
                  description: "Images updated successfully",
                });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
