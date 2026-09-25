/** Formatea un valor en pesos colombianos: 360000 → "$360.000" */
export const formatCOP = (value: number) => '$' + Math.round(value).toLocaleString('es-CO')
