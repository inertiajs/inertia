import { useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';

export function useStart(callback) {
  useEffect(() => {
    return Inertia.on('start', callback);
  }, []);
}

export function useSuccess(callback) {
  useEffect(() => {
    return Inertia.on('success', callback);
  }, []);
}

export function useBefore(callback) {
  useEffect(() => {
    return Inertia.on('before', callback);
  }, []);
}

export function useError(callback) {
  useEffect(() => {
    return Inertia.on('error', callback);
  }, []);
}

export function useFinish(callback) {
  useEffect(() => {
    return Inertia.on('finish', callback);
  }, []);
}

export function useInvalid(callback) {
  useEffect(() => {
    return Inertia.on('invalid', callback);
  }, []);
}

export function useProgress(callback) {
  useEffect(() => {
    return Inertia.on('progress', callback);
  }, []);
}

export function useNavigate(callback) {
  useEffect(() => {
    return Inertia.on('navigate', callback);
  }, []);
}
