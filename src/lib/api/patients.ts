import { supabase } from '../supabase'
import { Patient, CreatePatientData, Visit, Treatment, VisitTreatment } from '../types'

export async function getPatients(): Promise<Patient[]> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getPatient(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function createPatient(patientData: CreatePatientData): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .insert(patientData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updatePatient(id: string, updates: Partial<CreatePatientData>): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deletePatient(id: string): Promise<void> {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getPatientVisits(patientId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('patient_id', patientId)
    .order('visit_date', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createVisit(visitData: {
  patient_id: string
  visit_type?: string
  notes?: string
}): Promise<Visit> {
  const { data, error } = await supabase
    .from('visits')
    .insert(visitData)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateVisit(id: string, updates: Partial<{
  visit_type: string
  status: string
  notes: string
}>): Promise<Visit> {
  const { data, error } = await supabase
    .from('visits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getTreatments(): Promise<Treatment[]> {
  const { data, error } = await supabase
    .from('treatments')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function addTreatmentToVisit(visitId: string, treatmentId: string, quantity: number = 1): Promise<VisitTreatment> {
  // Get treatment details
  const { data: treatment } = await supabase
    .from('treatments')
    .select('*')
    .eq('id', treatmentId)
    .single()

  if (!treatment) throw new Error('Treatment not found')

  const { data, error } = await supabase
    .from('visit_treatments')
    .insert({
      visit_id: visitId,
      treatment_id: treatmentId,
      quantity,
      unit_price_cents: treatment.price_cents,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getVisitTreatments(visitId: string): Promise<(VisitTreatment & { treatment: Treatment })[]> {
  const { data, error } = await supabase
    .from('visit_treatments')
    .select(`
      *,
      treatment:treatments(*)
    `)
    .eq('visit_id', visitId)

  if (error) throw error
  return data || []
}

export async function removeTreatmentFromVisit(visitTreatmentId: string): Promise<void> {
  const { error } = await supabase
    .from('visit_treatments')
    .delete()
    .eq('id', visitTreatmentId)

  if (error) throw error
}
