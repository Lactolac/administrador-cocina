const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Datos de alimentación servida - Enero 2026
// Formato: [fecha, descripcion, desayunos, almuerzos, cenas, refrigerios, costo_desayunos, costo_almuerzos, costo_cenas, total]
const alimentacionData = [
  // 1/1/2026
  ['2026-01-01', 'Administración', 0, 0, 0, 0, 0, 0, 0, 0],
  ['2026-01-01', 'Producción', 0, 0, 0, 0, 0, 0, 0, 0],
  // 1/2/2026
  ['2026-01-02', 'Administración', 111, 168, 18, 18, 26.64, 80.64, 4.32, 111.60],
  ['2026-01-02', 'Producción', 117, 144, 61, 61, 28.08, 69.12, 14.64, 111.84],
  // 1/3/2026
  ['2026-01-03', 'Administración', 86, 55, 9, 9, 20.64, 26.40, 2.16, 49.20],
  ['2026-01-03', 'Producción', 75, 91, 10, 10, 18.00, 43.68, 2.40, 64.08],
  // 1/4/2026
  ['2026-01-04', 'Administración', 34, 34, 9, 9, 8.16, 16.32, 2.16, 26.64],
  ['2026-01-04', 'Producción', 1, 169, 1, 1, 0.24, 81.12, 0.24, 81.60],
  // 1/5/2026
  ['2026-01-05', 'Administración', 117, 149, 48, 48, 28.08, 71.52, 11.52, 111.12],
  ['2026-01-05', 'Producción', 100, 168, 63, 63, 24.00, 80.64, 15.12, 119.76],
  // 1/6/2026
  ['2026-01-06', 'Administración', 119, 136, 41, 18, 28.56, 65.28, 9.84, 103.68],
  ['2026-01-06', 'Producción', 110, 191, 64, 64, 26.40, 91.68, 15.36, 133.44],
  // 1/7/2026
  ['2026-01-07', 'Administración', 125, 119, 44, 22, 30.00, 57.12, 10.56, 97.68],
  ['2026-01-07', 'Producción', 101, 170, 68, 68, 24.24, 81.60, 16.32, 122.16],
  // 1/8/2026
  ['2026-01-08', 'Administración', 116, 145, 38, 38, 27.84, 69.60, 9.12, 106.56],
  ['2026-01-08', 'Producción', 99, 175, 70, 70, 23.76, 84.00, 16.80, 124.56],
  // 1/9/2026
  ['2026-01-09', 'Administración', 118, 135, 48, 21, 28.32, 64.80, 11.52, 104.64],
  ['2026-01-09', 'Producción', 104, 39, 70, 70, 24.96, 18.72, 16.80, 60.48],
  // 1/10/2026
  ['2026-01-10', 'Administración', 96, 70, 9, 9, 23.04, 33.60, 2.16, 58.80],
  ['2026-01-10', 'Producción', 69, 40, 8, 8, 16.56, 19.20, 1.92, 37.68],
  // 1/11/2026
  ['2026-01-11', 'Administración', 21, 1, 9, 9, 5.04, 0.48, 2.16, 7.68],
  ['2026-01-11', 'Producción', 10, 192, 2, 2, 2.40, 92.16, 0.48, 95.04],
  // 1/12/2026
  ['2026-01-12', 'Administración', 133, 150, 40, 22, 31.92, 72.00, 9.60, 113.52],
  ['2026-01-12', 'Producción', 112, 162, 75, 75, 26.88, 77.76, 18.00, 122.64],
  // 1/13/2026
  ['2026-01-13', 'Administración', 116, 153, 41, 18, 27.84, 73.44, 9.84, 111.12],
  ['2026-01-13', 'Producción', 99, 155, 72, 72, 23.76, 74.40, 17.28, 115.44],
  // 1/14/2026
  ['2026-01-14', 'Administración', 125, 138, 39, 39, 30.00, 66.24, 9.36, 105.60],
  ['2026-01-14', 'Producción', 99, 175, 75, 75, 23.76, 84.00, 18.00, 125.76],
  // 1/15/2026
  ['2026-01-15', 'Administración', 119, 141, 40, 18, 28.56, 67.68, 9.60, 105.84],
  ['2026-01-15', 'Producción', 99, 168, 72, 72, 23.76, 80.64, 17.28, 121.68],
  // 1/16/2026
  ['2026-01-16', 'Administración', 104, 157, 40, 22, 24.96, 75.36, 9.60, 109.92],
  ['2026-01-16', 'Producción', 129, 45, 65, 65, 30.96, 21.60, 15.60, 68.16],
  // 1/17/2026
  ['2026-01-17', 'Administración', 94, 78, 10, 10, 22.56, 37.44, 2.40, 62.40],
  ['2026-01-17', 'Producción', 73, 47, 1, 1, 17.52, 22.56, 0.24, 40.32],
  // 1/18/2026
  ['2026-01-18', 'Administración', 37, 2, 11, 11, 8.88, 0.96, 2.64, 12.48],
  ['2026-01-18', 'Producción', 3, 165, 1, 1, 0.72, 79.20, 0.24, 80.16],
  // 1/19/2026
  ['2026-01-19', 'Administración', 126, 149, 35, 23, 30.24, 71.52, 8.40, 110.16],
  ['2026-01-19', 'Producción', 99, 174, 62, 62, 23.76, 83.52, 14.88, 122.16],
  // 1/20/2026
  ['2026-01-20', 'Administración', 121, 150, 31, 31, 29.04, 72.00, 7.44, 108.48],
  ['2026-01-20', 'Producción', 99, 171, 64, 64, 23.76, 82.08, 15.36, 121.20],
  // 1/21/2026
  ['2026-01-21', 'Administración', 115, 168, 33, 33, 27.60, 80.64, 7.92, 116.16],
  ['2026-01-21', 'Producción', 99, 175, 63, 63, 23.76, 84.00, 15.12, 122.88],
  // 1/22/2026
  ['2026-01-22', 'Administración', 118, 144, 36, 36, 28.32, 69.12, 8.64, 106.08],
  ['2026-01-22', 'Producción', 93, 166, 61, 61, 22.32, 79.68, 14.64, 116.64],
  // 1/23/2026
  ['2026-01-23', 'Administración', 147, 144, 35, 18, 35.28, 69.12, 8.40, 112.80],
  ['2026-01-23', 'Producción', 104, 71, 64, 64, 24.96, 34.08, 15.36, 74.40],
  // 1/24/2026
  ['2026-01-24', 'Administración', 99, 75, 10, 10, 23.76, 36.00, 2.40, 62.16],
  ['2026-01-24', 'Producción', 74, 40, 10, 10, 17.76, 19.20, 2.40, 39.36],
  // 1/25/2026
  ['2026-01-25', 'Administración', 35, 41, 9, 9, 8.40, 19.68, 2.16, 30.24],
  ['2026-01-25', 'Producción', 44, 193, 1, 1, 10.56, 92.64, 0.24, 103.44],
  // 1/26/2026
  ['2026-01-26', 'Administración', 135, 149, 47, 22, 32.40, 71.52, 11.28, 115.20],
  ['2026-01-26', 'Producción', 95, 150, 64, 64, 22.80, 72.00, 15.36, 110.16],
  // 1/27/2026
  ['2026-01-27', 'Administración', 121, 149, 41, 34, 29.04, 71.52, 9.84, 110.40],
  ['2026-01-27', 'Producción', 118, 165, 70, 70, 28.32, 79.20, 16.80, 124.32],
  // 1/28/2026
  ['2026-01-28', 'Administración', 125, 150, 36, 21, 30.00, 72.00, 8.64, 110.64],
  ['2026-01-28', 'Producción', 99, 185, 70, 70, 23.76, 88.80, 16.80, 129.36],
  // 1/29/2026
  ['2026-01-29', 'Administración', 118, 150, 45, 23, 28.32, 72.00, 10.80, 111.12],
  ['2026-01-29', 'Producción', 101, 115, 70, 70, 24.24, 55.20, 16.80, 96.24],
  // 1/30/2026
  ['2026-01-30', 'Administración', 135, 143, 39, 21, 32.40, 68.64, 9.36, 110.40],
  ['2026-01-30', 'Producción', 106, 61, 75, 75, 25.44, 29.28, 18.00, 72.72],
  // 1/31/2026
  ['2026-01-31', 'Administración', 105, 45, 9, 9, 25.20, 21.60, 2.16, 48.96],
  ['2026-01-31', 'Producción', 76, 75, 1, 1, 18.24, 36.00, 0.24, 54.48],
];

async function importAlimentacion() {
  const client = await pool.connect();
  
  try {
    console.log('Iniciando importación de alimentación servida - Enero 2026...\n');
    
    // Verificar si ya existen datos de enero 2026
    const existingCheck = await client.query(`
      SELECT COUNT(*) FROM ${schema}.alimentacion_servida 
      WHERE mes = 'Enero' AND anio = 2026
    `);
    
    if (parseInt(existingCheck.rows[0].count) > 0) {
      console.log('Ya existen registros de Enero 2026. Eliminando registros existentes...');
      await client.query(`
        DELETE FROM ${schema}.alimentacion_servida 
        WHERE mes = 'Enero' AND anio = 2026
      `);
    }
    
    // Insertar datos
    let insertCount = 0;
    for (const row of alimentacionData) {
      const [fecha, descripcion, desayunos, almuerzos, cenas, refrigerios, costo_desayunos, costo_almuerzos, costo_cenas, total] = row;
      
      await client.query(`
        INSERT INTO ${schema}.alimentacion_servida 
        (fecha, descripcion, desayunos, almuerzos, cenas, refrigerios, costo_desayunos, costo_almuerzos, costo_cenas, total, mes, anio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Enero', 2026)
      `, [fecha, descripcion, desayunos, almuerzos, cenas, refrigerios, costo_desayunos, costo_almuerzos, costo_cenas, total]);
      
      insertCount++;
    }
    
    console.log(`✅ Se insertaron ${insertCount} registros de alimentación servida.\n`);
    
    // Mostrar resumen
    const summary = await client.query(`
      SELECT 
        descripcion,
        SUM(desayunos) as total_desayunos,
        SUM(almuerzos) as total_almuerzos,
        SUM(cenas) as total_cenas,
        SUM(refrigerios) as total_refrigerios,
        SUM(costo_desayunos) as total_costo_desayunos,
        SUM(costo_almuerzos) as total_costo_almuerzos,
        SUM(costo_cenas) as total_costo_cenas,
        SUM(total) as total_general
      FROM ${schema}.alimentacion_servida
      WHERE mes = 'Enero' AND anio = 2026
      GROUP BY descripcion
    `);
    
    console.log('📊 Resumen por área:');
    console.log('='.repeat(80));
    for (const row of summary.rows) {
      console.log(`\n${row.descripcion}:`);
      console.log(`  Desayunos: ${row.total_desayunos} | Almuerzos: ${row.total_almuerzos} | Cenas: ${row.total_cenas} | Refrigerios: ${row.total_refrigerios}`);
      console.log(`  Costo Desayunos: $${parseFloat(row.total_costo_desayunos).toFixed(2)} | Costo Almuerzos: $${parseFloat(row.total_costo_almuerzos).toFixed(2)} | Costo Cenas: $${parseFloat(row.total_costo_cenas).toFixed(2)}`);
      console.log(`  TOTAL: $${parseFloat(row.total_general).toFixed(2)}`);
    }
    
    // Total general
    const totalGeneral = await client.query(`
      SELECT 
        SUM(desayunos) as total_desayunos,
        SUM(almuerzos) as total_almuerzos,
        SUM(cenas) as total_cenas,
        SUM(refrigerios) as total_refrigerios,
        SUM(total) as total_general
      FROM ${schema}.alimentacion_servida
      WHERE mes = 'Enero' AND anio = 2026
    `);
    
    console.log('\n' + '='.repeat(80));
    console.log('📈 TOTALES GENERALES:');
    const tg = totalGeneral.rows[0];
    console.log(`  Desayunos: ${tg.total_desayunos} | Almuerzos: ${tg.total_almuerzos} | Cenas: ${tg.total_cenas} | Refrigerios: ${tg.total_refrigerios}`);
    console.log(`  TOTAL GENERAL: $${parseFloat(tg.total_general).toFixed(2)}`);
    
    console.log('\n✅ Importación completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
    throw error;
  } finally {
    client.release();
    pool.end();
  }
}

importAlimentacion();
