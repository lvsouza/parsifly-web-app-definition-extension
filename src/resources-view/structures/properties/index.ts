import { ListViewItem, TExtensionContext } from 'parsifly-extension-base';
import { asc, eq } from 'drizzle-orm';

import { property, Structure, StructureProperty, structureProperty } from '../../../definition/schema';
import { createDatabaseHelper } from '../../../definition/DatabaseHelper';
import { loadProperty } from '../../property';


type TParentDetails = Pick<Structure, 'id' | 'type'> | Pick<StructureProperty, 'id' | 'type'>;
export const loadStructureProperties = async (extensionContext: TExtensionContext, projectId: string, parent: TParentDetails): Promise<ListViewItem[]> => {
  const databaseHelper = createDatabaseHelper(extensionContext);

  const items = await databaseHelper
    .select({ id: property.id })
    .from(structureProperty)
    .innerJoin(property, eq(property.id, structureProperty.propertyId))
    .where(eq(structureProperty.structureId, parent.id))
    .orderBy(asc(property.name));

  const properties = await Promise.all(items.map(item => loadProperty(extensionContext, projectId, item.id)))

  return properties;
}
