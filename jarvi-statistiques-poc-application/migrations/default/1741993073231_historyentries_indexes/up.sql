SET check_function_bodies = false;
CREATE FUNCTION public.on_historyentries_update_set_default_sender() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF (NEW.sender_user_id IS NULL) THEN
    NEW.sender_user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE INDEX historyentries_user_id_idx ON public.historyentries USING btree (user_id);
CREATE INDEX historyentries_created_at_idx ON public.historyentries USING btree (created_at);
