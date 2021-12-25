import {
  Entity,
  Tree,
  Column,
  PrimaryGeneratedColumn,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity('category')
@Tree('closure-table', {
  ancestorColumnName: (column) => 'ancestor_' + column.propertyName,
  descendantColumnName: (column) => 'descendant_' + column.propertyName,
})
export class Category {
  @PrimaryGeneratedColumn('increment', {
    type: 'int',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 500,
  })
  title: string;

  @Column({
    type: 'datetime',
    default: () => 'NOW()',
  })
  date_created: Date;

  @TreeChildren({ cascade: ['insert', 'update', 'remove'] })
  children: Category[];

  @TreeParent({
    onDelete: 'CASCADE',
  })
  parent: Category;
}
