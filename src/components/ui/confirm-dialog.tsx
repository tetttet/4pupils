"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: React.ReactNode;
  description?: React.ReactNode;

  confirmText?: string;
  cancelText?: string;

  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  confirmClassName?: string;

  loading?: boolean;
  disabled?: boolean;

  onConfirm: () => void | Promise<void>;
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Подтвердите действие",
  description = "Вы уверены? Это действие нельзя отменить.",
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  confirmVariant = "destructive",
  confirmClassName,
  loading,
  disabled,
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = React.useState(false);

  const isLoading = loading ?? busy;

  async function handleConfirm() {
    if (disabled || isLoading) return;

    try {
      setBusy(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-105">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="text-sm">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled || isLoading}
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={confirmVariant}
            className={cn(confirmClassName)}
            onClick={handleConfirm}
            disabled={disabled || isLoading}
          >
            {isLoading ? "..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
