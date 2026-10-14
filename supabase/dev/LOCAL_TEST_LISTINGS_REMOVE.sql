-- Removes everything added by LOCAL_TEST_LISTINGS.sql
delete from properties where slug like 'test-%';
delete from locations where slug in ('test-area-a','test-area-b');
