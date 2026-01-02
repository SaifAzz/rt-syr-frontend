import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Eye,
  FileText,
  ExternalLink,
  User,
  Building2,
  FolderTree,
  Mail,
  Phone,
  Calendar,
  Clock,
} from 'lucide-react';
import { adminAPI, type SignupRequestRecord } from '@/lib/api';
import { toast } from 'sonner';

export function SignupRequestsManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'all' | 'company' | 'organization'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedRequest, setSelectedRequest] = useState<SignupRequestRecord | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'need_more_info'>('approve');
  const [reasonNote, setReasonNote] = useState('');

  // Fetch signup requests
  const { data: signupRequestsData, isLoading, error } = useQuery({
    queryKey: ['admin-signup-requests', statusFilter, page, limit],
    queryFn: async () => {
      const status = statusFilter === 'all' ? undefined : statusFilter as any;
      return await adminAPI.getSignupRequests({
        page,
        limit,
        status,
      });
    },
  });

  // Filter requests by role on client side
  const filteredRequests = signupRequestsData?.requests.filter((req) => {
    if (activeTab === 'company') return req.role === 'company';
    if (activeTab === 'organization') return req.role === 'organization';
    return req.role === 'company' || req.role === 'organization';
  }).filter((req) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.email.toLowerCase().includes(query) ||
      req.full_name.toLowerCase().includes(query) ||
      req.phone?.toLowerCase().includes(query)
    );
  }) || [];

  // Approve/reject mutation
  const approveRequestMutation = useMutation({
    mutationFn: async ({ requestId, action, note }: { requestId: string; action: 'approve' | 'reject' | 'need_more_info'; note?: string }) => {
      return await adminAPI.approveSignupRequest(requestId, action, note);
    },
    onSuccess: () => {
      toast.success('Request updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-signup-requests'] });
      setActionDialogOpen(false);
      setSelectedRequest(null);
      setReasonNote('');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update request');
    },
  });

  const handleActionClick = (request: SignupRequestRecord, action: 'approve' | 'reject' | 'need_more_info') => {
    setSelectedRequest(request);
    setActionType(action);
    setReasonNote('');
    setActionDialogOpen(true);
  };

  const handleSubmitAction = () => {
    if (!selectedRequest) return;
    
    const note = actionType !== 'approve' ? reasonNote : undefined;
    approveRequestMutation.mutate({
      requestId: selectedRequest.id,
      action: actionType,
      note,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'need_more_info':
        return (
          <Badge className="bg-yellow-500">
            <AlertCircle className="w-3 h-3 mr-1" />
            Need More Info
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'company':
        return <Building2 className="w-4 h-4" />;
      case 'organization':
        return <FolderTree className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Signup Requests Management</h2>
        <p className="text-muted-foreground mt-1">
          Review and manage company and organization signup requests
        </p>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by email, name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="need_more_info">Need More Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for filtering by role */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="company">Companies</TabsTrigger>
          <TabsTrigger value="organization">Organizations</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading requests...</p>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">Failed to load requests. Please try again.</p>
              </CardContent>
            </Card>
          ) : filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No requests found</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getRoleIcon(request.role)}
                            <CardTitle className="text-lg">{request.full_name}</CardTitle>
                            <Badge variant="outline">{request.role}</Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {request.email}
                            </span>
                            {request.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {request.phone}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(request.created_at).toLocaleDateString()}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Links and files */}
                        {(request.drive_link || request.commercial_file_url) && (
                          <div className="flex flex-wrap gap-2">
                            {request.drive_link && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(request.drive_link!, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Google Drive Link
                              </Button>
                            )}
                            {request.commercial_file_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(request.commercial_file_url!, '_blank')}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                Commercial File
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Reason note if exists */}
                        {request.reason_note && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Admin Note:</p>
                            <p className="text-sm text-muted-foreground">{request.reason_note}</p>
                          </div>
                        )}

                        {/* Reviewed info */}
                        {request.reviewed_by && request.reviewed_at && (
                          <div className="text-xs text-muted-foreground">
                            Reviewed by {request.reviewed_by.full_name} on{' '}
                            {new Date(request.reviewed_at).toLocaleString()}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 pt-2 border-t">
                          {request.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActionClick(request, 'approve')}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActionClick(request, 'reject')}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActionClick(request, 'need_more_info')}
                                className="text-yellow-600 hover:text-yellow-700"
                              >
                                <AlertCircle className="w-4 h-4 mr-2" />
                                Request More Info
                              </Button>
                            </>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Request Details</DialogTitle>
                                  <DialogDescription>
                                    Detailed information about this signup request
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Full Name</Label>
                                      <p className="text-sm font-medium">{request.full_name}</p>
                                    </div>
                                    <div>
                                      <Label>Email</Label>
                                      <p className="text-sm font-medium">{request.email}</p>
                                    </div>
                                    <div>
                                      <Label>Role</Label>
                                      <p className="text-sm font-medium capitalize">{request.role}</p>
                                    </div>
                                    {request.phone && (
                                      <div>
                                        <Label>Phone</Label>
                                        <p className="text-sm font-medium">{request.phone}</p>
                                      </div>
                                    )}
                                    <div>
                                      <Label>Status</Label>
                                      <div className="mt-1">{getStatusBadge(request.status)}</div>
                                    </div>
                                    <div>
                                      <Label>Created At</Label>
                                      <p className="text-sm font-medium">
                                        {new Date(request.created_at).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  {request.drive_link && (
                                    <div>
                                      <Label>Google Drive Link</Label>
                                      <a
                                        href={request.drive_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                      >
                                        {request.drive_link}
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                  {request.commercial_file_url && (
                                    <div>
                                      <Label>Commercial File</Label>
                                      <a
                                        href={request.commercial_file_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline flex items-center gap-1"
                                      >
                                        View File
                                        <ExternalLink className="w-3 h-3" />
                                      </a>
                                    </div>
                                  )}
                                  {request.reason_note && (
                                    <div>
                                      <Label>Admin Note</Label>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {request.reason_note}
                                      </p>
                                    </div>
                                  )}
                                  {request.reviewed_by && (
                                    <div>
                                      <Label>Reviewed By</Label>
                                      <p className="text-sm font-medium">
                                        {request.reviewed_by.full_name} ({request.reviewed_by.email})
                                      </p>
                                      {request.reviewed_at && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {new Date(request.reviewed_at).toLocaleString()}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {signupRequestsData && signupRequestsData.pagination.totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: signupRequestsData.pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setPage(pageNum)}
                          isActive={page === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(signupRequestsData.pagination.totalPages, p + 1))}
                        className={
                          page === signupRequestsData.pagination.totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' && 'Approve Request'}
              {actionType === 'reject' && 'Reject Request'}
              {actionType === 'need_more_info' && 'Request More Information'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' && 'Are you sure you want to approve this signup request?'}
              {actionType === 'reject' && 'Please provide a reason for rejecting this request.'}
              {actionType === 'need_more_info' && 'Please specify what additional information is needed.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRequest && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">{selectedRequest.full_name}</p>
                <p className="text-xs text-muted-foreground">{selectedRequest.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{selectedRequest.role}</p>
              </div>
            )}
            {actionType !== 'approve' && (
              <div className="space-y-2">
                <Label>Reason Note {actionType === 'reject' ? '(Required)' : '(Optional)'}</Label>
                <Textarea
                  value={reasonNote}
                  onChange={(e) => setReasonNote(e.target.value)}
                  placeholder={
                    actionType === 'reject'
                      ? 'Please explain why this request is being rejected...'
                      : 'Please specify what additional information is needed...'
                  }
                  rows={4}
                  required={actionType === 'reject'}
                />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitAction}
                disabled={approveRequestMutation.isPending || (actionType === 'reject' && !reasonNote.trim())}
                className={
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : actionType === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }
              >
                {approveRequestMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

