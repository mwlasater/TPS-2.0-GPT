UPDATE shared.power_bi_embed
SET
  workspace_id = CASE id
    WHEN 'bi_caltrain_1' THEN '11111111-1111-1111-1111-111111111111'
    WHEN 'bi_caltrain_2' THEN '11111111-1111-1111-1111-111111111111'
    WHEN 'bi_capmetro_1' THEN '22222222-2222-2222-2222-222222222222'
    ELSE workspace_id
  END,
  external_report_id = CASE id
    WHEN 'bi_caltrain_1' THEN 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    WHEN 'bi_caltrain_2' THEN 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'
    WHEN 'bi_capmetro_1' THEN 'cccccccc-cccc-cccc-cccc-cccccccccccc'
    ELSE external_report_id
  END
WHERE id IN ('bi_caltrain_1', 'bi_caltrain_2', 'bi_capmetro_1');
