const pool = require('../config/database');

const schema = process.env.DB_SCHEMA || 'administradorcocina';

const checkDuplicates = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await pool.connect();

    // Check for duplicate products by description and unit of measure
    const duplicateQuery = `
      SELECT LOWER(descripcion) as descripcion, LOWER(unidad_medida) as unidad_medida, COUNT(*) as count
      FROM ${schema}.productos
      GROUP BY LOWER(descripcion), LOWER(unidad_medida)
      HAVING COUNT(*) > 1
      ORDER BY count DESC
    `;

    const duplicateResult = await pool.query(duplicateQuery);
    
    if (duplicateResult.rows.length > 0) {
      console.log(`Se encontraron ${duplicateResult.rows.length} productos duplicados:`);
      
      for (const duplicate of duplicateResult.rows) {
        console.log(`- ${duplicate.descripcion} (${duplicate.unidad_medida}) - ${duplicate.count} veces`);
        
        // Get all duplicates for this product
        const productDetailsQuery = `
          SELECT id, descripcion, unidad_medida, precio_unitario, categoria, created_at
          FROM ${schema}.productos
          WHERE LOWER(descripcion) = LOWER($1) AND LOWER(unidad_medida) = LOWER($2)
          ORDER BY created_at
        `;
        
        const productDetailsResult = await pool.query(productDetailsQuery, [
          duplicate.descripcion,
          duplicate.unidad_medida
        ]);
        
        // Keep the first occurrence and delete the rest
        const mainProductId = productDetailsResult.rows[0].id;
        const duplicatesToDelete = productDetailsResult.rows.slice(1).map(row => row.id);
        
        console.log(`  Mantener producto: ${mainProductId}`);
        console.log(`  Eliminar duplicados: ${duplicatesToDelete}`);
        
        // Delete duplicate entries
        for (const duplicateId of duplicatesToDelete) {
          // Check if there are any inventory records associated with this product
          const inventoryCheckQuery = `
            SELECT COUNT(*) as count
            FROM ${schema}.inventario
            WHERE producto_id = $1
          `;
          
          const inventoryCheckResult = await pool.query(inventoryCheckQuery, [duplicateId]);
          
          if (inventoryCheckResult.rows[0].count > 0) {
            console.log(`  El producto ${duplicateId} tiene ${inventoryCheckResult.rows[0].count} registros de inventario. Moviendo registros...`);
            
            // Move inventory records to main product
            const updateInventoryQuery = `
              UPDATE ${schema}.inventario
              SET producto_id = $1
              WHERE producto_id = $2
            `;
            
            await pool.query(updateInventoryQuery, [mainProductId, duplicateId]);
          }
          
          // Delete the duplicate product
          const deleteProductQuery = `
            DELETE FROM ${schema}.productos
            WHERE id = $1
          `;
          
          await pool.query(deleteProductQuery, [duplicateId]);
        }
      }
      
      console.log('Duplicados eliminados correctamente');
    } else {
      console.log('No se encontraron productos duplicados');
    }

    // Verify the total count after deduplication
    const totalCountQuery = `
      SELECT COUNT(*) as count
      FROM ${schema}.productos
    `;
    
    const totalCountResult = await pool.query(totalCountQuery);
    
    console.log(`Total de productos después de deduplicar: ${totalCountResult.rows[0].count}`);

  } catch (error) {
    console.error('Error al verificar duplicados:', error);
  } finally {
    await pool.end();
  }
};

checkDuplicates();
