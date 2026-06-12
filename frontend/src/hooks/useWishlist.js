import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { wishlistService } from '../services';
import { useAuth } from '../context/AuthContext';

const wishlistCache = new Map();
const priceDropSeen = new Set();

export function useWishlist() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load wishlist IDs and check price drops once auth has settled.
  useEffect(() => {
    if (authLoading || !isAuthenticated || user?.role !== 'BUYER' || !user?.id) return;

    const init = async () => {
      const cacheKey = user.id;
      const cached = wishlistCache.get(cacheKey);
      if (cached) {
        setWishlistIds(cached.ids);
        return;
      }

      setLoading(true);
      try {
        const [idsRes, dropsRes] = await Promise.all([
          wishlistService.getIds(),
          wishlistService.checkPriceDrops(),
        ]);
        const ids = new Set(idsRes.data || []);
        setWishlistIds(ids);
        wishlistCache.set(cacheKey, { ids });

        const drops = dropsRes.data || [];
        drops.forEach((d) => {
          if (priceDropSeen.has(d.cropId)) return;
          priceDropSeen.add(d.cropId);
          toast.success(
            `💰 Price Drop! ${d.cropName} dropped from ₹${d.oldPrice}/kg to ₹${d.newPrice}/kg`,
            { duration: 6000, id: `drop-${d.cropId}` }
          );
        });
      } catch (err) {
        if (err?.status !== 401 && err?.status !== 403) {
          // Silent fail — non-critical, but keep non-auth failures from poisoning the cache.
        }
        wishlistCache.delete(cacheKey);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [authLoading, isAuthenticated, user?.role, user?.id]);

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
        if (user?.id) {
          wishlistCache.set(user.id, { ids: new Set(wishlistIds) });
        }
      } catch (err) {
        // Revert optimistic update on error
        setWishlistIds((prev) => {
          const next = new Set(prev);
          if (isWishlisted) next.add(cropId);
          else next.delete(cropId);
          return next;
        });
        if (err?.status !== 403) {
          toast.error(err.message || 'Failed to update wishlist');
        }
      }
    },
    [isAuthenticated, user?.role, wishlistIds]
  );

  const isWishlisted = useCallback((cropId) => wishlistIds.has(cropId), [wishlistIds]);

  return { wishlistIds, isWishlisted, toggle, loading };
}
