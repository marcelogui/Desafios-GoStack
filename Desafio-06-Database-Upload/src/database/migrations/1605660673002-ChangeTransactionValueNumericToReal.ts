import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class ChangeTransactionValueNumericToReal1605658366460
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(
      'transactions',
      'value',
      new TableColumn({ name: 'value', type: 'real' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(
      'transactions',
      'value',
      new TableColumn({ name: 'value', type: 'decimal' }),
    );
  }
}
