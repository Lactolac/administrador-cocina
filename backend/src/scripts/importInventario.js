const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const schema = process.env.DB_SCHEMA || 'administradorcocina';

// Inventory data provided by user
const inventoryData = `ACEITE COMESTIBLE ORISOL 18.93lt	BIDON	$ 38.6000	2.25
AZUCAR BLANCA  REFINADA	LIBRA	$ 0.6715	275
BANDEJA DESCARTABLE N 8	UNIDAD	$ 0.0988	150
BOLSA TRANSPARENTE 5 LIBRAS	UNIDAD	$ 0.0400	1541
BOLSA TRANSPARENTE 17X21(regalía)	UNIDAD	$ 0.0900	901
BOLSA TRANSPARENTE 22X32 (1/2 jardín)	UNIDAD	$ 0.1100	347
BOLSA TRANSPARENTE 34X50 ( jardinera)	UNIDAD	$ 0.2400	83
CAFÉ MOLIDO	LIBRA	$ 3.0974	23
CUCHARA DESC. P/POSTRE	UNIDAD	$ 0.0144	800
CUCHILLO DESCARTABLE	UNIDAD	$ 0.0136	8725
GORROS (100 unidades)	BOLSA	$ 4.0000	6
GUANTES DE NITRILO TL	PAR	$ 0.2125	0
GUANTES DE NITRILO TM	PAR	$ 0.2105	50
GUANTES DE NITRILO TS	PAR	$ 0.2085	1100
JABON LIQUIDO SUCRO NP-2030	BIDON	$ 46.9300	0.25
MASCARILLAS DE AMARRAR	UNIDAD	$ 0.0400	550
PAPEL ROLL EXTENDER(caja de 12 u)	UNIDAD	$ 7.4600	10
PAPEL TOALLA TIPO MAYORDOMO (fardo 24u)	BS1	$ 1.0333	25
PAPEL TORK CON PLUG(caka de 6 u)	UNIDAD	$ 7.0000	8
PAPEL DE TOALLA DE MANOS TORK(Cde 6 u)	C6	$ 7.0000	5
PLATO DESCARTABLE N° 9	PAQ 25	$ 0.7000	43
POLIPEL (500 u)	RESMA	$ 11.4400	5.5
SAL INDUSTRIAL REFINADA	LIBRA	$ 0.3098	50.5
SERVILLETAS KIMLARK (fardo 24u)	PAQ	$ 0.4838	117
SOPERO DESCARTABLE N° 32 C X 10 (caja 250u	UNIDAD	$ 0.2402	200
TENEDOR DESCARTABLE GRANDE(fardo de 1000u	UNIDAD	$ 0.0120	1350
VASO DESCARTABLE No  8 (caja de 1000u)	UNIDAD	$ 0.0280	3237
LEGIA MAGIA BLANCA	GALON	$ 2.8700	1
ALKEMY CB 401	GALON	$ -	7
STRIPER	GALON	$ -	2
EXTRA CLEAN	GALON	$ -	3
SANIGIZER PLUS	GALON	$ -	0
JABON DE MANOS PLUS FREE FOAM	GALON	$ -	0
ALCOHOL DE MANOS DES -E	GALON	$ -	0
ACTIGEL	GALON	$ -	2
XY12	BIDON	$ 179.6500	0.9
BIOSAP	GALON	$ 4.8100	2
AGUACATES	CAJA	26.0000	0
AJO	CAJA	19.0000	2
AJO	CAJA	25.0000	0
ALCAPATE	MANOJO	1.7500	2
ALCAPATE	MANOJO	1.8000	0
ALCAPATE	MANOJO	2.5000	0
APIO	MANOJO	2.2500	0
APIO	MANOJO	3.0000	0.5
AYOTES	UNIDAD	1.2000	0
BROCOLI	UNIDAD	1.6000	9
BROCOLI	UNIDAD	1.5000	0
CEBOLLA BLANCA	LIBRA	0.7300	82.9
CEBOLLAS BLANCAS	LIBRA	0.7000	0
CEBOLLAS BLANCAS	LIBRA	0.8800	0
CEBOLLAS BLANCAS	LIBRA	0.7800	0
CEBOLLAS BLANCAS	LIBRA	0.7500	0
CHILE CIRUELA	LIBRA	9.0000	0
CHILE GUAJO	LIBRA	8.0000	0
CHILE VERDE	LIBRA	0.8500	15.2
CHILE VERDE	LIBRA	0.6800	0
CHILE VERDE	LIBRA	0.6200	0
CHILE JALAPEÑOS	LIBRA	1.1500	0
CHILE JALAPEÑOS	LIBRA	1.0000	0
CHILES ROJOS Y AMARILLO	LIBRA	3.0000	0
CHIPILÍN	MANOJO	2.0000	0
CILANTRO 	MANOJO	5.0000	2.5
CILANTRO 	MANOJO	4.0000	0
EJOTE 	LIBRA	2.0000	0
EJOTE 	LIBRA	1.8500	0
ELOTES CRIOLLOS	UNIDAD	0.2500	0
ELOTES CRIOLLOS	UNIDAD	0.3000	0
ESPINACAS	MANOJO	2.7500	0
ESPINACAS	MANOJO	3.0000	0
GUISQUIL CHAPIN	UNIDAD	0.4000	63
GUISQUIL CHAPIN	UNIDAD	0.3500	0
HOJA DE HUERTA	ROLLO	2.0000	0
JAMAICA	LIBRA	6.0000	9
JENGIBRE	LIBRA	3.5000	0
LECHUGAS REPOLLADAS	UNIDAD	0.8000	0
LECHUGAS REPOLLADAS	UNIDAD	0.8500	0
LECHUGAS REPOLLADAS	UNIDAD	0.7000	0
LIMONES	UNIDAD	0.1500	213
LIMONES	UNIDAD	0.2000	0
LIMONES	UNIDAD	0.1500	0
LOROCO	LIBRA	5.0000	0
LOROCO	LIBRA	4.7500	0
LOROCO	LIBRA	7.0000	0
MANTECA DE CERDO	LIBRA	3.5000	0
PAPA SOLOMA	LIBRA	1.0000	0
PAPA SOLOMA	LIBRA	0.5400	0
PAPA SOLOMA	LIBRA	0.8000	0
PAPA SOLOMA 	LIBRA	0.8000	0
PEPINOS 	UNIDAD	0.5000	60
PEPINOS 	UNIDAD	0.4000	0
PEPINOS 	UNIDAD	0.4400	0
PIPIANES	UNIDAD	0.4200	0
PLATANOS	UNDAD	0.3000	0
PLATANOS	UNIDAD	0.3200	0
RABANOS	LIBRAS	1.0000	0
RABANOS	LIBRAS	1.0000	0
REPOLLOS 	UNIDAD	2.5000	0
REPOLLOS 	UNIDAD	2.0000	0
RETOÑOS DE SOYA	LIBRAS	2.0000	0
TOMATES DE COCINA  	LIBRAS	0.6800	0
TOMATES DE COCINA  	LIBRAS	0.7000	0
TOMATES DE COCINA  	LIBRAS	0.7200	0
TOMATES DE COCINA  	LIBRAS	0.8000	219.8
TOMATES PARA SALSA  	LIBRAS	0.7500	59.4
TOMATES PARA SALSA  	LIBRAS	0.4500	0
TOMATES PARA SALSA  	LIBRAS	0.4800	0
TOMATES PARA SALSA  	LIBRAS	0.4000	0
YUCA	UNIDAD	0.9000	0
YUCA	UNIDAD	1.0000	0
YUCA	UNIDAD	1.1500	0
ZANAHORIA	LIBRAS	0.2300	0
ZANAHORIA	LIBRAS	0.2500	0
BANANOS	CAJA	17.0000	0
BANANOS	CAJA	18.0000	0
BANANOS DE SEDA	UNIDADES	0.2200	0
GUAYABAS	CAJA	20.0000	0
MANZANA GALA	CAJA	48.0000	0
MANZANA ROJAS	CAJA	54.0000	0
MELONES	UNIDADES	3.0000	0
PAPAYAS	CAJA	19.0000	0
PIÑAS GOLDEN	UNIDAD	3.2500	0
SANDIAS	UNIDAD	4.7500	0
SANDIAS	UNIDAD	4.5000	0
TAMARINDO	LBS	2.5000	0
UVAS	LIBRAS	4.2500	0
AJO EN POLVO BADIA 297.7 gs	UNIDAD	5.6048	0
AJO EN POLVO BADIA 680 gs	UNIDAD	12.9950	0
ARROZ PRECOCIDO SAN FRANCISCO 	B5	3.6499	0
ARROZ PRECOCIDO SAN FRANCISCO 	B4	2.9504	0
AVENA EN HOJUELAS QUAKER	PACK2	3.8985	0
BOLSA SANDWICHERA 2LBS selectos	PAQ./50U	0.5500	4
CANELA EN RAJA 20 grs	BOLSA	1.3500	0
CANELA EN RAJA 85 grs	BOLSA	3.7000	6
CANELA EN RAJA PROINCA	BOLSA	4.0000	0
ALETA	LIBRA	5.3000	0
BISTECK DE RES AL MINUTO	LIBRA	3.9500	126.1
BISTECK DE RES AL MINUTO	LIBRA	4.1000	0
CARNE MOLIDA  SUPER ESPECIAL	LIBRA	3.7500	47.4
CARNE MOLIDA  SUPER ESPECIAL	LIBRA	3.6000	0
CARNE MOLIDA  SUPER ESPECIAL	LIBRA	3.4500	0
CARNE MOLIDA  SUPER ESPECIAL	LIBRA	3.3500	0
COSTILLA ALTA DE RES	LIBRA	2.9500	10
GATO DE RES	LIBRA	4.1000	10
GUISO DE RES ESPECIAL	LIBRA	3.9000	0
CHORIZO PAMPERO	LIBRA	3.1000	10
CHORIZO ARGENTINO DANY	LIBRA	2.6500	44.7
CHORIZO MEXICANO DANY	LIBRA	2.5000	8.4
CHORIZO MEXICANO DANY	LIBRA	3.7500	0
FILETE DE PESCADO	LIBRA	6.3393	0
JAMÓN FAMILIAR	LIBRA	1.9900	5.1
JAMÓN VIRGINIA DANY	LIBRA	2.9500	0
JAMÓN VIRGINIA DANY	LIBRA	3.7500	0
LONGANIZA CAMPESTRE TOLEDO	LIBRA	2.6000	16
SALCHICHA HOTDOG	LIBRA	3.4000	19.8
SALCHICHA DE PAVO DANY	LIBRA	1.6000	14.5
SALCHICHA DE PAVO DANY	LIBRA	1.6000	0
LECHUGA PALMITO	UNIDAD	0.6000	0
LECHUGA PALMITO	UNIDAD	0.8000	0
LECHUGA ROMANA	UNIDAD	0.7000	0
MELON	UNIDAD	2.3300	0
REPOLLO MORADO	UNIDAD	3.7500	0
CONSOME CARNE LA FAMILIA 454 gr	BOLSA	1.2000	3
CONSOME CARNE  ROBERTONI 454 gr	BOLSA	1.2317	0
CONSOME DE POLLO ROBERTONI	BOLSA	1.2317	0
CONSOME DE POLLO ROBERTONI	BOLSA	1.1000	0
CONSOME DE POLLO ROBERTONI	BOLSA	1.1550	0
CHAOMEIN CON SOYA DRAGON 180G	BOLSA	0.8487	11
ESPAGUETTIS FAMA 800 GRS	BOLSA	1.6500	5
CODITOS FMA 200G	BOLSA	0.4000	0
CODITOS FMA 200G	BOLSA	0.4500	0
CHILE JALISCO 685 GRS	BOTE	5.6104	0
CHILE JALISCO 148 ML	BOTE	1.6309	0
CHOCOLATE EN TABLILLA/HERVIR	UNIDAD	1.7700	29
CHOCOLATE EN TABLILLA/HERVIR	LIBRA	2.5400	0
ENCENDEDOR BIC	UNIDAD	1.2090	0
FIDEO PARMESSANA EN TIRA	UNIDAD	1.2500	1
FRIJOL ROJO DE SEDA DON FRIJOL	B4	5.8000	0
FLAN DE VAINILLA LA FAMILIA 400grs	BOLSA	1.7500	28
GELATINAS DE SABORES 400GR	BOLSA	1.1500	11
LECHE EN POLVO DOS PINOS 2200GRS	BOLSA	29.2000	1
HARINA DE MAÍZ MASECA (bolsa de 25 lib.)	SACO	12.9950	0.75
HARINA TODO USO FLORA 2000GR	BOLSA	5.9400	3
HARINA TODO USO FLORA 454GR	BOLSA	1.2800	3
MAYONESA PURA MCCORMICK	GALON	17.4000	0
MOSTAZA MCCOMIRCK	GALON	7.9700	0
MOSTAZA REGIA 3500 GRS	BOLSA	4.7500	0
MAIZENA ATOL BANANO 45GRS	CAJA	0.7100	0
MAIZENA ATOL BANANO 45GRS	CAJA	0.6250	0
MAIZENA ATOL BANANO 45GRS	CAJA	0.7400	0
MAIZENA ATOL VAINILLA 45GRS	CAJA	0.6250	0
MAIZENA ATOL VAINILLA 45GRS	CAJA	0.6996	0
MAIZENA NATURAL 185 grs	CAJA	1.6413	0
MAIZENA  ATOL FRESA	CAJA	0.6250	0
MAIZENA  ATOL FRESA	CAJA	0.7100	0
MAIZENA  ATOL FRESA	CAJA	0.7400	0
MAIZENA ATOL  MANZANA CANELA	CAJA	0.7100	0
MAIZENA ATOL  MANZANA CANELA	CAJA	0.7400	0
MAIZENA ATOL  MANZANA CANELA	CAJA	0.6250	0
MIGA DE PAN	LIBRA	1.2501	6
PASTA ROMA ESPAGUETTI	PACK4	1.5000	13
PASTA LASAGNA INA	CAJA	1.9500	10
POLVO PARA HORNEAR	BOTE	0.8983	0
PAN CROISSANT SIMPLE	UNIDAD	0.4500	0
PAN ARABE BAKERY PEQUEÑO	UNIDAD	0.2000	0
PAPEL ALUMINIO SELECTOS 500PIES	ROLLO	15.5036	0
PIMIENTA NEGRA MOLIDA BADIA 56 grs	BOTE	3.0312	0
REMOVEDOR DE CAFÉ (100 UNI )	CAJA	1.0900	13
RAPIDITAS BIMBO TM	UNIDAD	2.2000	10
SALSA BARBACOA KRAFT ORIGINAL	UNIDAD	14.6500	0
SALSA DE TOMATE DEL MONTE 24 GRS.	UNIDAD	1.2500	45
SALSA BARBACOA KRAFT SMOKE	UNIDAD	3.2500	9
SALSA INGLESA REGGI 3.7L	GALON	7.2500	1
SALSA VERDE CLEMENTE 	UNIDAD	2.3000	2
SALSA VERDE B&B 	UNIDAD	2.2500	3
SALSA DE SOYA	GALON	7.5000	1.5
SOPA MAGGI POLLO CON FIDEOS	UNIDAD	0.4000	0
SOPA MAGGI COLA DE RES	SOBRE	0.7700	21
SAZON COMPLETO BADIA 793.8G	BOTE	10.7900	0
SUPER TISTE PROINCA (atol de maíz tosrado)340	bolsa	1.7500	0
 TANG VARIEDAD DE SABORES	SOBRE	0.3599	0
VINAGRE DE MANZANA	GALÓN	2.6500	0
VINAGRE DE MANZANA CLEMENTE	GALÓN	6.3000	1
VINAGRE BLANCO CLMENTE	GALÓN	4.1500	2
VAINILLA OSCURA LA FAMILIA	UNIDAD	0.9011	0
DESINFECTANTE FABULOSO MANZANA	GALON	8.7575	0
DETERGENTE DANY 10K	BOLSA	10.2900	0
FIBRA METALICA GRANDE 	UNIDAD	1.5900	0
FIBRA VERDE SCOTH BRITE	PACK	2.1300	0
LAVAPLATOS  SELECTOS  1000 GRS	TARRO	1.3500	0
LAVAPLATOS LIQUIDO AXION 750ML	BOTE	2.4900	0
LAVAPLATOS LIQUIDO AXION 750ML	BOTE	3.2996	0
TOALLA PARA TRAPEADOR	UNIDAD	3.6499	0
MOZZARELLA RALLADO (BOLSA DE 20LBS)	LIBRA	3.3333	0
REQUESON	LIBRA	1.5300	0
CREMA MINI PORCION	CAJA	3.3900	21
QUESILLO BLOCK 5 LBS	LIBRA	3.1640	0
QUESO MANTEQUILLA BLOCK 3.5 LBS	UNIDAD	10.5900	0
CREMA ESPECIAL GRANEL 10 BOT.	BOLSON	22.7700	0
POLLOS EN MITAD SIN ALAS	LIBRA	1.3799	0
PAVIPOLLO PEQUEÑO	LIBRA	1.4600	0
BOLSA DE POLLOS EN MITADES	LIBRA	1.3000	0
RECORTES DE PECHUGA	LIBRA	1.6300	0
RECORTES DE PECHUGA	LIBRA	1.7300	0
PECHUGAS DESHUESADAS	LIBRA	3.9800	0
FRIJOL ROJO SAN FRANCISCO GRANEL	LIBRA	1.3500	0
ARROZ PRE COCIDO SAN FRANCISCO	LIBRA	0.6499	0
ARROZ BLANCO 5 ESTRELLAS	LIBRA	0.6400	0
HARINA DE ARROZ	LIBRA	0.4398	0
HUEVOS MEDIANOS	UNIDAD	0.1333	0
HUEVOS MEDIANOS	UNIDAD	0.14167	1320
TORTILLAS	UNI	0.0625	925
CILINDROS DE GAS 25 LIBRAS	UNIDAD	11.0400	0`;

// Function to parse inventory data
const parseInventoryData = () => {
  const lines = inventoryData.split('\n');
  const products = [];

  lines.forEach(line => {
    if (line.trim()) {
      // Split line by tabs or multiple spaces
      const parts = line.trim().split(/\s{2,}|\t/);
      if (parts.length >= 4) {
        const [descripcion, unidadMedida, precioStr, cantidadStr] = parts;
        
        // Clean and parse price
        let precio = 0;
        if (precioStr) {
          const cleanPrecio = precioStr.replace(/\$|\s/g, '');
          if (cleanPrecio !== '-' && cleanPrecio !== '') {
            precio = parseFloat(cleanPrecio);
          }
        }

        // Parse quantity
        const cantidad = parseFloat(cantidadStr) || 0;

        products.push({
          descripcion: descripcion.trim(),
          unidad_medida: unidadMedida.trim(),
          precio_unitario: precio,
          cantidad: cantidad
        });
      }
    }
  });

  return products;
};

// Function to categorize products based on description
const getCategoria = (descripcion) => {
  const descLower = descripcion.toLowerCase();
  
  if (descLower.includes('aceite') || descLower.includes('azucar') || descLower.includes('cafe') || descLower.includes('leche') || descLower.includes('harina') || descLower.includes('frijol') || descLower.includes('arroz') || descLower.includes('maizena') || descLower.includes('pan') || descLower.includes('pasta') || descLower.includes('chocolate') || descLower.includes('flan') || descLower.includes('gelatina') || descLower.includes('mayonesa') || descLower.includes('mostaza') || descLower.includes('salsa') || descLower.includes('consome') || descLower.includes('sopa')) {
    return 'Alimentos';
  } else if (descLower.includes('bandeja') || descLower.includes('bolsa') || descLower.includes('cuchara') || descLower.includes('cuchillo') || descLower.includes('plato') || descLower.includes('soper') || descLower.includes('tenedor') || descLower.includes('vaso') || descLower.includes('papel') || descLower.includes('servilleta')) {
    return 'Utensilios';
  } else if (descLower.includes('gorro') || descLower.includes('guante') || descLower.includes('mascarilla') || descLower.includes('jabon') || descLower.includes('sanitizer') || descLower.includes('alcohol') || descLower.includes('desinfectante') || descLower.includes('detergente') || descLower.includes('lavaplatos') || descLower.includes('fibra') || descLower.includes('toalla')) {
    return 'Higiene';
  } else if (descLower.includes('aguacate') || descLower.includes('ajo') || descLower.includes('alcapat') || descLower.includes('apio') || descLower.includes('ayote') || descLower.includes('brocoli') || descLower.includes('cebolla') || descLower.includes('chile') || descLower.includes('chipilin') || descLower.includes('cilantro') || descLower.includes('ejote') || descLower.includes('elote') || descLower.includes('espinaca') || descLower.includes('guisquil') || descLower.includes('jamaica') || descLower.includes('jengibre') || descLower.includes('lechuga') || descLower.includes('limon') || descLower.includes('loroco') || descLower.includes('papa') || descLower.includes('pepino') || descLower.includes('pimiento') || descLower.includes('platano') || descLower.includes('rabano') || descLower.includes('repoll') || descLower.includes('tomate') || descLower.includes('yuca') || descLower.includes('zanahoria')) {
    return 'Verduras';
  } else if (descLower.includes('banano') || descLower.includes('guayaba') || descLower.includes('manzana') || descLower.includes('melon') || descLower.includes('papaya') || descLower.includes('pina') || descLower.includes('sandia') || descLower.includes('tamarindo') || descLower.includes('uva')) {
    return 'Frutas';
  } else if (descLower.includes('carne') || descLower.includes('res') || descLower.includes('cerdo') || descLower.includes('pescado') || descLower.includes('jamon') || descLower.includes('chorizo') || descLower.includes('longaniza') || descLower.includes('salchicha')) {
    return 'Carnes';
  } else if (descLower.includes('pollo') || descLower.includes('pavo') || descLower.includes('huevo')) {
    return 'Aves y Huevos';
  } else if (descLower.includes('queso') || descLower.includes('crema') || descLower.includes('requeson') || descLower.includes('mozzarella')) {
    return 'Lácteos';
  } else if (descLower.includes('gas')) {
    return 'Combustible';
  } else {
    return 'Otros';
  }
};

// Function to import data into database
const importData = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await pool.connect();
    console.log('Conexión exitosa');

    const products = parseInventoryData();
    console.log(`Se encontraron ${products.length} productos para importar`);

    // Get current date for inventory records
    const fecha = new Date();
    const mes = fecha.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
    const anio = fecha.getFullYear();

    let productosCreados = 0;
    let inventarioCreado = 0;

    // Import each product
    for (const product of products) {
      try {
        // Check if product already exists
        const checkQuery = `
          SELECT id FROM ${schema}.productos 
          WHERE LOWER(descripcion) = LOWER($1) 
          AND LOWER(unidad_medida) = LOWER($2)
        `;
        
        const checkResult = await pool.query(checkQuery, [
          product.descripcion,
          product.unidad_medida
        ]);

        let productoId;

        if (checkResult.rows.length > 0) {
          // Product exists, update it
          productoId = checkResult.rows[0].id;
          const updateQuery = `
            UPDATE ${schema}.productos 
            SET precio_unitario = $1, 
                categoria = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3
          `;
          
          await pool.query(updateQuery, [
            product.precio_unitario,
            getCategoria(product.descripcion),
            productoId
          ]);
        } else {
          // Product doesn't exist, create it
          const insertQuery = `
            INSERT INTO ${schema}.productos 
            (descripcion, unidad_medida, precio_unitario, categoria)
            VALUES ($1, $2, $3, $4)
            RETURNING id
          `;
          
          const insertResult = await pool.query(insertQuery, [
            product.descripcion,
            product.unidad_medida,
            product.precio_unitario,
            getCategoria(product.descripcion)
          ]);
          
          productoId = insertResult.rows[0].id;
          productosCreados++;
        }

        // Create or update inventory record
        const checkInventarioQuery = `
          SELECT id FROM ${schema}.inventario 
          WHERE producto_id = $1 AND mes = $2 AND anio = $3
        `;
        
        const checkInventarioResult = await pool.query(checkInventarioQuery, [
          productoId,
          mes,
          anio
        ]);

        if (checkInventarioResult.rows.length > 0) {
          // Inventory record exists, update it
          const updateInventarioQuery = `
            UPDATE ${schema}.inventario 
            SET inv_final = $1,
                precio_unitario = $2,
                total_inventario = $3
            WHERE id = $4
          `;
          
          await pool.query(updateInventarioQuery, [
            product.cantidad,
            product.precio_unitario,
            product.cantidad * product.precio_unitario,
            checkInventarioResult.rows[0].id
          ]);
        } else {
          // Inventory record doesn't exist, create it
          const insertInventarioQuery = `
            INSERT INTO ${schema}.inventario 
            (producto_id, fecha, inv_inicial, inv_final, precio_unitario, total_inventario, mes, anio)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          `;
          
          await pool.query(insertInventarioQuery, [
            productoId,
            fecha,
            product.cantidad,
            product.cantidad,
            product.precio_unitario,
            product.cantidad * product.precio_unitario,
            mes,
            anio
          ]);
          
          inventarioCreado++;
        }

      } catch (productError) {
        console.error(`Error importando producto: ${product.descripcion}`, productError);
      }
    }

    console.log(`Importación completa!`);
    console.log(`Productos creados: ${productosCreados}`);
    console.log(`Productos actualizados: ${products.length - productosCreados}`);
    console.log(`Registros de inventario creados: ${inventarioCreado}`);
    console.log(`Registros de inventario actualizados: ${products.length - inventarioCreado}`);

  } catch (error) {
    console.error('Error en la importación:', error);
  } finally {
    await pool.end();
  }
};

// Run the import
importData();
