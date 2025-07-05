import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Edit } from 'lucide-react';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

const InventoryManagement = () => {
  const { inventory, updateInventoryItem } = useSupabaseData();
  const { profile } = useSupabaseAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuantity, setEditQuantity] = useState('');

  const canManageInventory = profile?.role === 'receptionist' || profile?.role === 'manager';

  const handleQuantityUpdate = async (itemId: string, newQuantity: number) => {
    const success = await updateInventoryItem(itemId, { quantity: newQuantity });

    if (success) {
      toast({
        title: "Inventory updated",
        description: "Item quantity has been updated successfully."
      });
      setEditingItem(null);
      setEditQuantity('');
    } else {
      toast({
        title: "Error",
        description: "Failed to update inventory item.",
        variant: "destructive"
      });
    }
  };

  const startEditing = (item: any) => {
    setEditingItem(item.id);
    setEditQuantity(item.quantity.toString());
  };

  const cancelEditing = () => {
    setEditingItem(null);
    setEditQuantity('');
  };

  const isLowStock = (item: any) => item.quantity <= item.low_stock_threshold;
  const isExpiringSoon = (item: any) => {
    if (!item.expiry_date) return false;
    const expiryDate = new Date(item.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockItems = inventory.filter(isLowStock);
  const expiringSoonItems = inventory.filter(isExpiringSoon);

  const handleApply = async (item) => {
    if (item.quantity <= 0) return;
    const newQuantity = item.quantity - 1;
    const success = await updateInventoryItem(item.id, { quantity: newQuantity });
    if (success) {
      toast({
        title: 'Item applied',
        description: `One unit of ${item.name} has been applied.`,
      });
    } else {
      toast({
        title: 'Error',
        description: 'Failed to apply item.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
          <p className="text-muted-foreground">Track supplies and manage stock levels</p>
        </div>
      </div>

      {/* Alerts Section */}
      {(lowStockItems.length > 0 || expiringSoonItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-yellow-800">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Low Stock Alert ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">{item.quantity} {item.unit}</span>
                    </div>
                  ))}
                  {lowStockItems.length > 3 && (
                    <div className="text-sm text-yellow-600">
                      +{lowStockItems.length - 3} more items
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {expiringSoonItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-orange-800">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Expiring Soon ({expiringSoonItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {expiringSoonItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">
                        {item.expiry_date && new Date(item.expiry_date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {expiringSoonItems.length > 3 && (
                    <div className="text-sm text-orange-600">
                      +{expiringSoonItems.length - 3} more items
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inventory by name or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4">
            {filteredInventory.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      {isLowStock(item) && (
                        <Badge variant="destructive">Low Stock</Badge>
                      )}
                      {isExpiringSoon(item) && (
                        <Badge className="bg-orange-100 text-orange-800">Expiring Soon</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <strong>Quantity:</strong>
                        {editingItem === item.id ? (
                          <div className="flex items-center space-x-2 mt-1">
                            <Input
                              type="number"
                              value={editQuantity}
                              onChange={(e) => setEditQuantity(e.target.value)}
                              className="w-20 h-8"
                              min="0"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleQuantityUpdate(item.id, parseInt(editQuantity))}
                              className="h-8"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                              className="h-8"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>{item.quantity} {item.unit}</span>
                            {canManageInventory && (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditing(item)}
                                  className="h-6 w-6 p-0"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApply(item)}
                                  className="h-6 w-14 p-0 ml-2"
                                  disabled={item.quantity <= 0}
                                >
                                  Apply
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      <div>
                        <strong>Unit Cost:</strong> ${item.cost.toFixed(2)}
                      </div>

                      <div>
                        <strong>Low Stock Alert:</strong> {item.low_stock_threshold} {item.unit}
                      </div>

                      {item.expiry_date && (
                        <div>
                          <strong>Expires:</strong> {new Date(item.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {item.supplier && (
                      <div className="text-sm text-gray-600">
                        <strong>Supplier:</strong> {item.supplier}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}

            {filteredInventory.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No inventory items found matching your search.' : 'No inventory items found.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManagement;
