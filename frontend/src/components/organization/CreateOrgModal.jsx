import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createOrganization } from '../../redux/slices/organizationSlice';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const CreateOrgModal = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await dispatch(createOrganization({ name })).unwrap();
      toast.success("Organization created successfully");
      setOpen(false);
      setName('');
    } catch (error) {
      toast.error(error || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Plus className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Acme Corp" 
              required 
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
