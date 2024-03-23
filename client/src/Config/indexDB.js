// import { Dexie } from 'dexie'
// import { useLiveQuery } from 'dexie-react-hooks';

// const db = new Dexie('SyncUp')

// export const createTable = async (tableName, fields) => {
//     try {
//         if (fields?.length && !db[tableName]) {
//             db.version(2).stores({
//                 [tableName]: fields.join()
//             })
//         }
//     } catch (error) {
//         console.log('Err while Creating db ', error);
//     }
// }

// export const insertToTable = async (tableName, values) => {
//     try {
//         await db[tableName].clear()
//         values.forEach(async element => {
//             await db[tableName].add(element)
//         });
//     } catch (error) {
//         console.log('Err while adding data', error);
//     }
// }

// export const getDataFromTable = async (tableName) => {
//     try {
//         return await db[tableName].toArray()
//     } catch (error) {
//         console.log('Err while getting data', error);

//     }
// }

// export const useLiveData = (tableName) => {
//     try {
//         const data = useLiveQuery(() => db[tableName])
//         console.log('got Data',data,db[tableName],tableName);
//         // return data.toArray()
//     } catch (error) {
//         console.log('Err while getting data', error);

//     }
// }
