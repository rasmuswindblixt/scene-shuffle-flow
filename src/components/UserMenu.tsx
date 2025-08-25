import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// Admin user emails/IDs that have access to admin features
const ADMIN_USERS = [
  'admin',        // Dev admin user
  'admin_2',      // Dev admin user 2
  'clipmixpro@gmail.com', // Production admin
  // Add your production admin emails here
  // 'your-email@example.com',
];

const UserMenu = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  if (!user) return null;

  // Check if user is admin
  const isAdmin = ADMIN_USERS.includes(user.email || '') || ADMIN_USERS.includes(user.id || '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
        <DropdownMenuItem onClick={() => navigate('/account')}>
          Account
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/app')}>
          New project
        </DropdownMenuItem>
        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/blog-admin')} className="text-orange-600">
              Blog Admin
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => {
          await signOut();
          navigate('/');
        }}>
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;