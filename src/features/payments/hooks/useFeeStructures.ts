import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createStore } from '@/lib/localStore'
import type { FeeStructure, CreateFeeStructureDto } from '../types'

// ─── Store ────────────────────────────────────────────────────────────────────

const store = createStore<FeeStructure>('fee_structures')

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const feeStructureKeys = {
  all: ['fee-structures'] as const,
  detail: (id: string) => ['fee-structures', id] as const,
}

// ─── Fetch All ────────────────────────────────────────────────────────────────

function fetchFeeStructures(): FeeStructure[] {
  // TODO: replace with Supabase
  // const { data, error } = await supabase.from('fee_structures').select('*').order('created_at', { ascending: false })
  // if (error) throw error
  // return data as FeeStructure[]
  return store.getAll().sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export function useFeeStructures() {
  return useQuery({
    queryKey: feeStructureKeys.all,
    queryFn: fetchFeeStructures,
    staleTime: 0,
  })
}

// ─── Fetch for a specific class ───────────────────────────────────────────────

export function useFeeStructureForClass(classId: string | null) {
  return useQuery({
    queryKey: [...feeStructureKeys.all, 'class', classId],
    queryFn: () => {
      if (!classId) return null
      return store.getWhere(f => f.target_type === 'CLASS' && f.class_id === classId && f.is_active).at(0) ?? null
    },
    enabled: !!classId,
    staleTime: 0,
  })
}

// ─── Create ───────────────────────────────────────────────────────────────────

function createFeeStructure(dto: CreateFeeStructureDto): FeeStructure {
  // TODO: replace with Supabase
  const newStructure: FeeStructure = {
    id: crypto.randomUUID(),
    name: dto.name,
    target_type: dto.target_type,
    class_id: dto.class_id ?? null,
    batch_id: dto.batch_id ?? null,
    class_name: dto.class_name ?? null,
    batch_name: dto.batch_name ?? null,
    fee_items: dto.fee_items.map(item => ({ ...item, id: crypto.randomUUID() })),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  return store.insert(newStructure)
}

export function useCreateFeeStructure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createFeeStructure,
    onSuccess: () => qc.invalidateQueries({ queryKey: feeStructureKeys.all }),
  })
}

// ─── Update ───────────────────────────────────────────────────────────────────

function updateFeeStructure({ id, dto }: { id: string; dto: CreateFeeStructureDto }): FeeStructure {
  // TODO: replace with Supabase
  return store.update(id, {
    name: dto.name,
    target_type: dto.target_type,
    class_id: dto.class_id ?? null,
    batch_id: dto.batch_id ?? null,
    class_name: dto.class_name ?? null,
    batch_name: dto.batch_name ?? null,
    fee_items: dto.fee_items.map(item => ({ ...item, id: item.id ?? crypto.randomUUID() })),
    updated_at: new Date().toISOString(),
  })
}

export function useUpdateFeeStructure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: updateFeeStructure,
    onSuccess: () => qc.invalidateQueries({ queryKey: feeStructureKeys.all }),
  })
}

// ─── Toggle Active ────────────────────────────────────────────────────────────

function toggleFeeStructureActive({ id, is_active }: { id: string; is_active: boolean }): FeeStructure {
  return store.update(id, { is_active, updated_at: new Date().toISOString() })
}

export function useToggleFeeStructureActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: toggleFeeStructureActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: feeStructureKeys.all }),
  })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

function deleteFeeStructure(id: string): void {
  // TODO: replace with Supabase
  store.remove(id)
}

export function useDeleteFeeStructure() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteFeeStructure,
    onSuccess: () => qc.invalidateQueries({ queryKey: feeStructureKeys.all }),
  })
}
