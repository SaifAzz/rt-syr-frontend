import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Users,
  Calendar,
  Save,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  adminPricingAPI,
  adminUserPlanAPI,
  usersAPI,
  type AdminPricingPlan,
  type UserRecord,
  type UserPlanUpdate,
  type UserPlanManagement,
} from '@/lib/api';

export function PlanManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [isEditPlanOpen, setIsEditPlanOpen] = useState(false);
  const [isUserPlanOpen, setIsUserPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AdminPricingPlan | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'users'>('plans');

  // Form states
  const [planForm, setPlanForm] = useState({
    plan_id: '',
    name: '',
    description: '',
    price: '',
    currency: 'USD',
    period: 'one-time' as 'one-time' | 'yearly',
    plan_type: 'tender' as 'tender' | 'job' | 'combined' | 'vendor' | 'vendorAdvertisement',
    features: [''],
    discount_percentage: '',
    discount_amount: '',
    discount_start_date: '',
    discount_end_date: '',
    is_discount_active: false,
  });

  const [userPlanForm, setUserPlanForm] = useState<UserPlanUpdate>({
    plan_id: '',
    plan_status: 'free',
    plan_expires_at: '',
  });

  const [userPostLimitsForm, setUserPostLimitsForm] = useState<UserPlanManagement>({
    max_post_count: null,
    post_count_start_date: null,
    post_count_end_date: null,
  });

  // Fetch pricing plans
  const { data: plans = [], isLoading: plansLoading, refetch: refetchPlans } = useQuery<AdminPricingPlan[]>({
    queryKey: ['admin-pricing-plans'],
    queryFn: async () => {
      try {
        return await adminPricingAPI.getAll();
      } catch (error: any) {
        toast.error(error.message || 'Failed to load pricing plans');
        return [];
      }
    },
  });

  // Fetch users
  const { data: users = [], isLoading: usersLoading } = useQuery<UserRecord[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        return await usersAPI.getAll();
      } catch {
        return [];
      }
    },
  });

  // Create plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (data: typeof planForm) => {
      return await adminPricingAPI.create({
        plan_id: data.plan_id,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        currency: data.currency,
        period: data.period,
        plan_type: data.plan_type,
        features: data.features.filter((f) => f.trim() !== ''),
        discount_percentage: data.discount_percentage ? parseFloat(data.discount_percentage) : undefined,
        discount_amount: data.discount_amount ? parseFloat(data.discount_amount) : null,
        discount_start_date: data.discount_start_date || undefined,
        discount_end_date: data.discount_end_date || undefined,
        is_discount_active: data.is_discount_active,
      });
    },
    onSuccess: () => {
      toast.success('Pricing plan created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      setIsCreatePlanOpen(false);
      resetPlanForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create pricing plan');
    },
  });

  // Update plan mutation
  const updatePlanMutation = useMutation({
    mutationFn: async ({ planId, data }: { planId: string; data: Partial<typeof planForm> }) => {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description) updateData.description = data.description;
      if (data.price) updateData.price = parseFloat(data.price);
      if (data.currency) updateData.currency = data.currency;
      if (data.period) updateData.period = data.period;
      if (data.plan_type) updateData.plan_type = data.plan_type;
      if (data.features) updateData.features = data.features.filter((f) => f.trim() !== '');
      if (data.discount_percentage !== undefined) {
        updateData.discount_percentage = data.discount_percentage ? parseFloat(data.discount_percentage) : null;
      }
      if (data.discount_amount !== undefined) {
        updateData.discount_amount = data.discount_amount ? parseFloat(data.discount_amount) : null;
      }
      if (data.discount_start_date !== undefined) updateData.discount_start_date = data.discount_start_date || null;
      if (data.discount_end_date !== undefined) updateData.discount_end_date = data.discount_end_date || null;
      if (data.is_discount_active !== undefined) updateData.is_discount_active = data.is_discount_active;

      return await adminPricingAPI.update(planId, updateData);
    },
    onSuccess: () => {
      toast.success('Pricing plan updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
      setIsEditPlanOpen(false);
      setSelectedPlan(null);
      resetPlanForm();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update pricing plan');
    },
  });

  // Delete plan mutation
  const deletePlanMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await adminPricingAPI.delete(planId);
    },
    onSuccess: () => {
      toast.success('Pricing plan deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-plans'] });
      queryClient.invalidateQueries({ queryKey: ['pricing-plans'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete pricing plan');
    },
  });

  // Update user plan mutation
  const updateUserPlanMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UserPlanUpdate }) => {
      return await adminUserPlanAPI.updateUserPlan(userId, data);
    },
    onSuccess: () => {
      toast.success('User plan updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsUserPlanOpen(false);
      setSelectedUser(null);
      resetUserForms();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user plan');
    },
  });

  // Manage user post limits mutation
  const managePostLimitsMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UserPlanManagement }) => {
      return await adminUserPlanAPI.managePostLimits(userId, data);
    },
    onSuccess: () => {
      toast.success('User post limits updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsUserPlanOpen(false);
      setSelectedUser(null);
      resetUserForms();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user post limits');
    },
  });

  const resetPlanForm = () => {
    setPlanForm({
      plan_id: '',
      name: '',
      description: '',
      price: '',
      currency: 'USD',
      period: 'one-time',
      plan_type: 'tender',
      features: [''],
      discount_percentage: '',
      discount_amount: '',
      discount_start_date: '',
      discount_end_date: '',
      is_discount_active: false,
    });
  };

  const resetUserForms = () => {
    setUserPlanForm({
      plan_id: '',
      plan_status: 'free',
      plan_expires_at: '',
    });
    setUserPostLimitsForm({
      max_post_count: null,
      post_count_start_date: null,
      post_count_end_date: null,
    });
  };

  const handleEditPlan = (plan: AdminPricingPlan) => {
    setSelectedPlan(plan);
    setPlanForm({
      plan_id: plan.plan_id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      currency: plan.currency,
      period: plan.period,
      plan_type: plan.plan_type,
      features: plan.features.length > 0 ? plan.features : [''],
      discount_percentage: plan.discount_percentage || '',
      discount_amount: plan.discount_amount || '',
      discount_start_date: plan.discount_start_date || '',
      discount_end_date: plan.discount_end_date || '',
      is_discount_active: plan.is_discount_active,
    });
    setIsEditPlanOpen(true);
  };

  const handleManageUserPlan = (user: UserRecord) => {
    setSelectedUser(user);
    setUserPlanForm({
      plan_id: user.plan_id || '',
      plan_status: (user.plan_status as 'free' | 'paid' | 'expired') || 'free',
      plan_expires_at: '',
    });
    setUserPostLimitsForm({
      max_post_count: null,
      post_count_start_date: null,
      post_count_end_date: null,
    });
    setIsUserPlanOpen(true);
  };

  const handleAddFeature = () => {
    setPlanForm({ ...planForm, features: [...planForm.features, ''] });
  };

  const handleRemoveFeature = (index: number) => {
    const newFeatures = planForm.features.filter((_, i) => i !== index);
    setPlanForm({ ...planForm, features: newFeatures.length > 0 ? newFeatures : [''] });
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...planForm.features];
    newFeatures[index] = value;
    setPlanForm({ ...planForm, features: newFeatures });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Plan Management</h2>
          <p className="text-muted-foreground">Manage pricing plans and user subscriptions</p>
        </div>
        <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetPlanForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Pricing Plan</DialogTitle>
              <DialogDescription>Add a new pricing plan to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan ID *</Label>
                  <Input
                    value={planForm.plan_id}
                    onChange={(e) => setPlanForm({ ...planForm, plan_id: e.target.value })}
                    placeholder="e.g., tender-single"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="Single Tender"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description *</Label>
                <Textarea
                  value={planForm.description}
                  onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                  placeholder="Post one tender"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <Input
                    type="number"
                    value={planForm.price}
                    onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                    placeholder="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency *</Label>
                  <Select value={planForm.currency} onValueChange={(value) => setPlanForm({ ...planForm, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Period *</Label>
                  <Select value={planForm.period} onValueChange={(value: 'one-time' | 'yearly') => setPlanForm({ ...planForm, period: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Plan Type *</Label>
                <Select value={planForm.plan_type} onValueChange={(value: any) => setPlanForm({ ...planForm, plan_type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tender">Tender</SelectItem>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="combined">Combined</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                    <SelectItem value="vendorAdvertisement">Vendor Advertisement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Features *</Label>
                {planForm.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                    />
                    {planForm.features.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFeature(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddFeature} className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Feature
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Percentage</Label>
                  <Input
                    type="number"
                    value={planForm.discount_percentage}
                    onChange={(e) => setPlanForm({ ...planForm, discount_percentage: e.target.value })}
                    placeholder="10.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount Amount</Label>
                  <Input
                    type="number"
                    value={planForm.discount_amount}
                    onChange={(e) => setPlanForm({ ...planForm, discount_amount: e.target.value })}
                    placeholder="5.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Start Date</Label>
                  <Input
                    type="datetime-local"
                    value={planForm.discount_start_date}
                    onChange={(e) => setPlanForm({ ...planForm, discount_start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Discount End Date</Label>
                  <Input
                    type="datetime-local"
                    value={planForm.discount_end_date}
                    onChange={(e) => setPlanForm({ ...planForm, discount_end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_discount_active"
                  checked={planForm.is_discount_active}
                  onChange={(e) => setPlanForm({ ...planForm, is_discount_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_discount_active">Discount Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createPlanMutation.mutate(planForm)}
                  disabled={createPlanMutation.isPending}
                >
                  {createPlanMutation.isPending ? 'Creating...' : 'Create Plan'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('plans')}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'plans'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <DollarSign className="w-4 h-4 inline mr-2" />
            Pricing Plans
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-1 border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            User Plans
          </button>
        </div>
      </div>

      {/* Pricing Plans Tab */}
      {activeTab === 'plans' && (
        <div className="space-y-4">
          {plansLoading ? (
            <div className="text-center py-12">Loading plans...</div>
          ) : plans.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No pricing plans found. Create your first plan!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan) => (
                <Card key={plan.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {plan.name}
                          <Badge variant="outline">{plan.plan_type}</Badge>
                          {plan.is_discount_active && (
                            <Badge variant="default" className="bg-green-500">
                              Discount Active
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">{plan.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this plan?')) {
                              deletePlanMutation.mutate(plan.plan_id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Price</Label>
                        <p className="font-semibold">
                          {plan.currency} {plan.price}
                        </p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Period</Label>
                        <p className="font-semibold capitalize">{plan.period}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Plan ID</Label>
                        <p className="font-semibold text-sm">{plan.plan_id}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Discount</Label>
                        <p className="font-semibold">
                          {plan.discount_percentage ? `${plan.discount_percentage}%` : 'None'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label className="text-xs text-muted-foreground">Features</Label>
                      <ul className="mt-2 space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* User Plans Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {usersLoading ? (
            <div className="text-center py-12">Loading users...</div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No users found.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>User Plans</CardTitle>
                <CardDescription>Manage user subscription plans and post limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{user.full_name}</p>
                          <Badge variant="outline">{user.email}</Badge>
                          {user.plan_status && (
                            <Badge
                              variant={
                                user.plan_status === 'paid'
                                  ? 'default'
                                  : user.plan_status === 'expired'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {user.plan_status}
                            </Badge>
                          )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          {user.plan_id && (
                            <span>Plan: {user.plan_id}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleManageUserPlan(user)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Manage Plan
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={isEditPlanOpen} onOpenChange={setIsEditPlanOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Pricing Plan</DialogTitle>
            <DialogDescription>Update pricing plan details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plan ID</Label>
                <Input value={planForm.plan_id} disabled />
              </div>
              <div className="space-y-2">
                <Label>Plan Name *</Label>
                <Input
                  value={planForm.name}
                  onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description *</Label>
              <Textarea
                value={planForm.description}
                onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price *</Label>
                <Input
                  type="number"
                  value={planForm.price}
                  onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency *</Label>
                <Select value={planForm.currency} onValueChange={(value) => setPlanForm({ ...planForm, currency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Period *</Label>
                <Select value={planForm.period} onValueChange={(value: 'one-time' | 'yearly') => setPlanForm({ ...planForm, period: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One-time</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plan Type *</Label>
              <Select value={planForm.plan_type} onValueChange={(value: any) => setPlanForm({ ...planForm, plan_type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tender">Tender</SelectItem>
                  <SelectItem value="job">Job</SelectItem>
                  <SelectItem value="combined">Combined</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="vendorAdvertisement">Vendor Advertisement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Features *</Label>
              {planForm.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => handleFeatureChange(index, e.target.value)}
                  />
                  {planForm.features.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={handleAddFeature} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Percentage</Label>
                <Input
                  type="number"
                  value={planForm.discount_percentage}
                  onChange={(e) => setPlanForm({ ...planForm, discount_percentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount Amount</Label>
                <Input
                  type="number"
                  value={planForm.discount_amount}
                  onChange={(e) => setPlanForm({ ...planForm, discount_amount: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Discount Start Date</Label>
                <Input
                  type="datetime-local"
                  value={planForm.discount_start_date}
                  onChange={(e) => setPlanForm({ ...planForm, discount_start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Discount End Date</Label>
                <Input
                  type="datetime-local"
                  value={planForm.discount_end_date}
                  onChange={(e) => setPlanForm({ ...planForm, discount_end_date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit_is_discount_active"
                checked={planForm.is_discount_active}
                onChange={(e) => setPlanForm({ ...planForm, is_discount_active: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="edit_is_discount_active">Discount Active</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditPlanOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedPlan) {
                    updatePlanMutation.mutate({ planId: selectedPlan.plan_id, data: planForm });
                  }
                }}
                disabled={updatePlanMutation.isPending}
              >
                {updatePlanMutation.isPending ? 'Updating...' : 'Update Plan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Manage User Plan Dialog */}
      <Dialog open={isUserPlanOpen} onOpenChange={setIsUserPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage User Plan</DialogTitle>
            <DialogDescription>
              Manage plan and post limits for {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* User Plan Section */}
            <div className="space-y-4">
              <h3 className="font-semibold">User Plan</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Plan ID</Label>
                  <Select
                    value={userPlanForm.plan_id || 'none'}
                    onValueChange={(value) => setUserPlanForm({ ...userPlanForm, plan_id: value === 'none' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.plan_id}>
                          {plan.name} ({plan.plan_id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plan Status</Label>
                  <Select
                    value={userPlanForm.plan_status}
                    onValueChange={(value: 'free' | 'paid' | 'expired') =>
                      setUserPlanForm({ ...userPlanForm, plan_status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Plan Expires At</Label>
                  <Input
                    type="datetime-local"
                    value={userPlanForm.plan_expires_at}
                    onChange={(e) => setUserPlanForm({ ...userPlanForm, plan_expires_at: e.target.value })}
                  />
                </div>
                <Button
                  onClick={() => {
                    if (selectedUser) {
                      updateUserPlanMutation.mutate({
                        userId: selectedUser.id,
                        data: userPlanForm,
                      });
                    }
                  }}
                  disabled={updateUserPlanMutation.isPending}
                  className="w-full"
                >
                  {updateUserPlanMutation.isPending ? 'Updating...' : 'Update User Plan'}
                </Button>
              </div>
            </div>

            {/* Post Limits Section */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Post Limits Management</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Max Post Count</Label>
                  <Input
                    type="number"
                    value={userPostLimitsForm.max_post_count || ''}
                    onChange={(e) =>
                      setUserPostLimitsForm({
                        ...userPostLimitsForm,
                        max_post_count: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    placeholder="Leave empty for unlimited (uses default free limit of 2)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave empty for unlimited (uses default free limit of 2)
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Post Count Start Date</Label>
                    <Input
                      type="datetime-local"
                      value={userPostLimitsForm.post_count_start_date || ''}
                      onChange={(e) =>
                        setUserPostLimitsForm({
                          ...userPostLimitsForm,
                          post_count_start_date: e.target.value || null,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Post Count End Date</Label>
                    <Input
                      type="datetime-local"
                      value={userPostLimitsForm.post_count_end_date || ''}
                      onChange={(e) =>
                        setUserPostLimitsForm({
                          ...userPostLimitsForm,
                          post_count_end_date: e.target.value || null,
                        })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    if (selectedUser) {
                      managePostLimitsMutation.mutate({
                        userId: selectedUser.id,
                        data: userPostLimitsForm,
                      });
                    }
                  }}
                  disabled={managePostLimitsMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {managePostLimitsMutation.isPending ? 'Updating...' : 'Update Post Limits'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

