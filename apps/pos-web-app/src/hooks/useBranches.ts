import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

const API_BASE = 'http://localhost:3000/api';

export interface Branch {
  id: number;
  name: string;
  code: string;
}

export const useBranches = () => {
  const { token } = useAuthStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    
    const fetchBranches = async () => {
      try {
        const res = await fetch(`${API_BASE}/branches`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          // Adjust based on the actual shape returned by your API
          const branchList = data.data || data; 
          setBranches(Array.isArray(branchList) ? branchList : []);
        }
      } catch (err) {
        console.error('Failed to fetch branches', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBranches();
  }, [token]);

  const getBranchName = (branchId: number | string | null | undefined) => {
    if (!branchId) return 'Main HQ';
    const id = typeof branchId === 'string' ? parseInt(branchId, 10) : branchId;
    const branch = branches.find(b => b.id === id);
    return branch ? `${branch.name} (${branch.code})` : `Branch ${id}`;
  };

  return { branches, getBranchName, loading };
};
