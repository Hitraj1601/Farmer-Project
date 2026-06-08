import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { wishlistService } from '../services';
import { useAuth } from '../context/AuthContext';

export function useWishlist() {
  const { user, isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load wishlist IDs and check price drops on mount (buyer only)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'BUYER') return;

    const init = async () => {
      setLoading(true);
      try {
        const [idsRes, dropsRes] = await Promise.all([
          wishlistService.getIds(),
          wishlistService.checkPriceDrops(),
        ]);
        setWishlistIds(new Set(idsRes.data || []));

        const drops = dropsRes.data || [];
        drops.forEach((d) => {
          toast.success(
            `💰 Price Drop! ${d.cropName} dropped from ₹${d.oldPrice}/kg to ₹${d.newPrice}/kg`,
            { duration: 6000, id: `drop-${d.cropId}` }
          );
        });
      } catch {
        // Silent fail — non-critical
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isAuthenticated, user?.role]);

  const toggle = useCallback(
    async (cropId) => {
      if (!isAuthenticated || user?.role !== 'BUYER') {
        toast.error('Please log in as a buyer to use the wishlist.');
        return;
      }

      const isWishlisted = wishlistIds.has(cropId);

      // Optimistic update
      setWishlistIds((prev) => {
        const next = new Set(prev);
        if (isWishlisted) next.delete(cropId);
        else next.add(cropId);
        return next;
      });

      try {
        if (isWishlisted) {
          await wishlistService.remove(cropId);
          toast.success('Removed from wishlist');
        } else {
          await wishlistService.add(cropId);
          toast.success('Added to wishlist ❤️');
        }
      } catch (err) {
        // Revert optimistic update on error
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (isWishlisted) next.add(cropId);
          else next.delete(cropId);
          return next;
        });
        toast.error(err.message || 'Failed to update wishlist');
      }
    },
    [isAuthenticated, user?.role, wishlistIds]
  );

  const isWishlisted = useCallback((cropId) => wishlistIds.has(cropId), [wishlistIds]);

  return { wishlistIds, isWishlisted, toggle, loading };
}
