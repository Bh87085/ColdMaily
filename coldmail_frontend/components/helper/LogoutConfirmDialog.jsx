"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { handleLogout } from "@/utils/logout";

export default function LogoutConfirmDialog({ open, onOpenChange }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const onConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      handleLogout(); // clear cookies and redirect
    } catch (error) {
      toast.error("Logout failed");
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Confirm Logout</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600">
          Are you sure you want to log out? You will be redirected to the login page.
        </div>

        <DialogFooter className="mt-4 ">
          <DialogClose asChild>
            <Button variant="ghost" disabled={isLoggingOut} className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={onConfirmLogout}
            disabled={isLoggingOut}
            className="cursor-pointer"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Logging out...
              </>
            ) : (
              "Logout"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
