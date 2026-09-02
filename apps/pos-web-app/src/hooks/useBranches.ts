import { useState, useEffect } from 'react';
import api, { extractArray } from '@/lib/api';

export interface Branch {
  id: number;
  name: string;
  code: string;
}

export const useBranches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBranches = async () => {
    try {
      const res = await api.get('/branches');
      setBranches(extractArray<Branch>(res.data));
    } catch (err) {
      console.error('Failed to fetch branches', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const getBranchName = (branchId: number | string | null | undefined) => {
    if (!branchId) return 'Main HQ';
    const id = typeof branchId === 'string' ? parseInt(branchId, 10) : branchId;
    const branch = branches.find(b => b.id === id);
    return branch ? `${branch.name} (${branch.code})` : `Branch ${id}`;
  };

  return { branches, getBranchName, loading, refetch: fetchBranches };
};
