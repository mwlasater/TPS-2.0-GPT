UPDATE shared.fare_enforcement
SET
  amtrak_transfers = 2,
  amtrak_tickets = 3,
  upass_count = 5,
  tickets_sold = 4
WHERE id = 'fare_caltrain_101_1';

UPDATE shared.fare_enforcement
SET
  amtrak_transfers = 0,
  amtrak_tickets = 1,
  upass_count = 6,
  tickets_sold = 2
WHERE id = 'fare_capmetro_550_1';

UPDATE shared.fare_enforcement
SET
  amtrak_transfers = 1,
  amtrak_tickets = 2,
  upass_count = 4,
  tickets_sold = 3
WHERE id = 'fare_tre_221_1';
