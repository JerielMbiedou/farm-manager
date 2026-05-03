import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type Subscriber = (
  opts: ConfirmOptions,
  resolve: (value: boolean) => void,
) => void;

let subscriber: Subscriber | null = null;

export function confirmAction(opts: ConfirmOptions = {}): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    if (!subscriber) {
      const ok = window.confirm(opts.description || opts.title || "Confirmer ?");
      resolve(ok);
      return;
    }
    subscriber(opts, resolve);
  });
}

export function ConfirmDialogHost() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  useEffect(() => {
    subscriber = (o, resolve) => {
      setOpts(o);
      setResolver(() => resolve);
      setOpen(true);
    };
    return () => {
      subscriber = null;
    };
  }, []);

  const handleClose = (value: boolean) => {
    setOpen(false);
    if (resolver) resolver(value);
    setResolver(null);
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleClose(false); }}>
      <AlertDialogContent data-testid="confirm-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{opts.title || "Confirmer l'action"}</AlertDialogTitle>
          {opts.description && (
            <AlertDialogDescription>{opts.description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => handleClose(false)} data-testid="confirm-cancel">
            {opts.cancelText || "Annuler"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleClose(true)}
            className={opts.destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
            data-testid="confirm-ok"
          >
            {opts.confirmText || "Confirmer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
