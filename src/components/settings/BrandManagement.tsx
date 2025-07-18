import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X, Globe } from "lucide-react";
import { Brand, Keyword, NotificationSettings } from "./types";

interface BrandManagementProps {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  editingBrand: Brand | null;
  setEditingBrand: React.Dispatch<React.SetStateAction<Brand | null>>;
  isAddingBrand: boolean;
  setIsAddingBrand: React.Dispatch<React.SetStateAction<boolean>>;
  newBrand: { name: string; website: string };
  setNewBrand: React.Dispatch<
    React.SetStateAction<{ name: string; website: string }>
  >;
  handleSaveBrand: () => void;
  handleAddBrand: () => void;
  handleDeleteBrand: (brandId: string) => void;
}

const BrandManagement = ({
  brands,
  setBrands,
  editingBrand,
  setEditingBrand,
  isAddingBrand,
  setIsAddingBrand,
  newBrand,
  setNewBrand,
  handleSaveBrand,
  handleAddBrand,
  handleDeleteBrand,
}: BrandManagementProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Brand Management
          </CardTitle>
          <Button
            onClick={() => setIsAddingBrand(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingBrand && (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-4">
              <form
                className="grid grid-cols-2 gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddBrand();
                }}
              >
                <div>
                  <Label htmlFor="new-brand-name">Brand Name</Label>
                  <Input
                    id="new-brand-name"
                    value={newBrand.name}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, name: e.target.value })
                    }
                    placeholder="Enter brand name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="new-brand-website">Website</Label>
                  <Input
                    id="new-brand-website"
                    type="url"
                    required
                    value={newBrand.website}
                    onChange={(e) =>
                      setNewBrand({ ...newBrand, website: e.target.value })
                    }
                    placeholder="https://example.com"
                  />
                </div>
                <div className="flex gap-2 mt-4 col-span-2">
                  <Button type="submit" size="sm" className="flex items-center gap-2">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    type="button"
                    className="flex items-center gap-2"
                    onClick={() => {
                      setIsAddingBrand(false);
                      setNewBrand({ name: '', website: '' });
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {brands.map((brand) => (
          <Card key={brand.id} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      {editingBrand && editingBrand.id === brand.id ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSaveBrand();
                          }}
                        >
                          <Input
                            className="font-semibold text-lg mb-1 w-96"
                            value={editingBrand.name}
                            onChange={(e) =>
                              setEditingBrand({
                                ...editingBrand,
                                name: e.target.value,
                              })
                            }
                            required
                          />
                          <Input
                            className="font-semibold text-lg mt-2 w-96"
                            value={editingBrand.website}
                            type="url"
                            required
                            onChange={(e) =>
                              setEditingBrand({
                                ...editingBrand,
                                website: e.target.value,
                              })
                            }
                          />
                          <div className="flex gap-2 mt-2">
                            <Button type="submit" size="sm" className="flex items-center gap-2">
                              <Save className="h-4 w-4 mr-2" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              type="button"
                              className="flex items-center gap-2"
                              onClick={() => setEditingBrand(null)}
                              >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <h3 className="font-semibold text-lg">
                            {brand.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {brand.website}
                          </p>
                        </>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {brand.keywords.length} keywords
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!(editingBrand && editingBrand.id === brand.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingBrand(brand)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteBrand(brand.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default BrandManagement;
