import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

interface FavoriteButtonProps {
  analysisId: number;
  className?: string;
  size?: "sm" | "default" | "lg" | "icon";
}

export default function FavoriteButton({ analysisId, className, size = "icon" }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const { data: favoriteStatus } = trpc.favorites.check.useQuery(
    { analysisId },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (favoriteStatus !== undefined) {
      setIsFavorite(favoriteStatus);
    }
  }, [favoriteStatus]);

  const addMutation = trpc.favorites.add.useMutation({
    onSuccess: () => {
      setIsFavorite(true);
      toast.success("Adicionado aos favoritos");
    },
    onError: () => {
      toast.error("Erro ao adicionar favorito");
    },
  });

  const removeMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      setIsFavorite(false);
      toast.success("Removido dos favoritos");
    },
    onError: () => {
      toast.error("Erro ao remover favorito");
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  const handleToggle = () => {
    if (isFavorite) {
      removeMutation.mutate({ analysisId });
    } else {
      addMutation.mutate({ analysisId });
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={className}
      onClick={handleToggle}
      disabled={addMutation.isPending || removeMutation.isPending}
    >
      <Heart
        className={`h-5 w-5 ${
          isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
        }`}
      />
    </Button>
  );
}
