import { useCallback, useRef, useEffect } from "react";

export const useAbortableFetch = () => {
  const isMountedRef = useRef(true);
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    return controller;
  }, []);

  const cleanupAbortController = useCallback((controller: AbortController) => {
    abortControllersRef.current.delete(controller);
  }, []);

  const safeSetState = useCallback((stateSetter: () => void) => {
    if (isMountedRef.current) {
      stateSetter();
    }
  }, []);

  // Abort specific controller
  const abortController = useCallback((controller: AbortController) => {
    controller.abort();
    cleanupAbortController(controller);
  }, [cleanupAbortController]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllersRef.current.forEach((controller) => controller.abort());
      abortControllersRef.current.clear();
    };
  }, []);

  return {
    createAbortController,
    cleanupAbortController,
    abortController,
    safeSetState,
    isMounted: () => isMountedRef.current,
  };
};