--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6 (Debian 16.6-1.pgdg120+1)
-- Dumped by pg_dump version 16.6

-- Started on 2025-02-25 21:59:20

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: bhxh_system_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO bhxh_system_user;

--
-- TOC entry 283 (class 1255 OID 16398)
-- Name: mark_batch_as_paid(integer, integer); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.mark_batch_as_paid(p_batch_id integer, p_user_id integer) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Kiểm tra trạng thái hiện tại
    IF NOT EXISTS (
        SELECT 1 FROM declaration_batch 
        WHERE id = p_batch_id 
        AND status = 'approved'
    ) THEN
        RETURN FALSE;
    END IF;

    -- Cập nhật trạng thái
    UPDATE declaration_batch 
    SET status = 'paid',
        updated_at = CURRENT_TIMESTAMP,
        updated_by = p_user_id
    WHERE id = p_batch_id;

    RETURN TRUE;
END;
$$;


ALTER FUNCTION public.mark_batch_as_paid(p_batch_id integer, p_user_id integer) OWNER TO bhxh_system_user;

--
-- TOC entry 287 (class 1255 OID 16815)
-- Name: update_adjustments_updated_at(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_adjustments_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_adjustments_updated_at() OWNER TO bhxh_system_user;

--
-- TOC entry 284 (class 1255 OID 16399)
-- Name: update_batch_payment_amount(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_batch_payment_amount() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Cập nhật payment_amount bằng tổng actual_amount trừ đi tổng số tiền hỗ trợ
    UPDATE declaration_batch
    SET payment_amount = (
        SELECT COALESCE(SUM(d.actual_amount), 0) - (COALESCE(declaration_batch.support_amount, 0) * COUNT(d.id))
        FROM declarations d
        WHERE d.batch_id = declaration_batch.id
        AND d.deleted_at IS NULL
    )
    WHERE id = NEW.batch_id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_batch_payment_amount() OWNER TO bhxh_system_user;

--
-- TOC entry 290 (class 1255 OID 17326)
-- Name: update_dot_ke_khai_status(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_dot_ke_khai_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.trang_thai = 'da_duyet' THEN
        UPDATE public.dot_ke_khai
        SET trang_thai = 'hoan_thanh'
        WHERE id = NEW.dot_ke_khai_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_dot_ke_khai_status() OWNER TO bhxh_system_user;

--
-- TOC entry 289 (class 1255 OID 17296)
-- Name: update_dot_ke_khai_tong_so_the(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_dot_ke_khai_tong_so_the() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE dot_ke_khai
        SET tong_so_the = tong_so_the + 1
        WHERE id = NEW.dot_ke_khai_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE dot_ke_khai
        SET tong_so_the = tong_so_the - 1
        WHERE id = OLD.dot_ke_khai_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_dot_ke_khai_tong_so_the() OWNER TO bhxh_system_user;

--
-- TOC entry 288 (class 1255 OID 17292)
-- Name: update_dot_ke_khai_total(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_dot_ke_khai_total() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Cập nhật tổng số tiền cho đợt kê khai khi thêm/sửa/xóa kê khai BHYT
    IF TG_OP = 'INSERT' THEN
        UPDATE dot_ke_khai
        SET tong_so_tien = tong_so_tien + NEW.so_tien_can_dong
        WHERE id = NEW.dot_ke_khai_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE dot_ke_khai
        SET tong_so_tien = tong_so_tien - OLD.so_tien_can_dong + NEW.so_tien_can_dong
        WHERE id = NEW.dot_ke_khai_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE dot_ke_khai
        SET tong_so_tien = tong_so_tien - OLD.so_tien_can_dong
        WHERE id = OLD.dot_ke_khai_id;
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION public.update_dot_ke_khai_total() OWNER TO bhxh_system_user;

--
-- TOC entry 285 (class 1255 OID 16400)
-- Name: update_payment_amount_on_support_change(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_payment_amount_on_support_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Cập nhật payment_amount khi support_amount thay đổi
    UPDATE declaration_batch
    SET payment_amount = (
        SELECT COALESCE(SUM(d.actual_amount), 0) - (NEW.support_amount * COUNT(d.id))
        FROM declarations d
        WHERE d.batch_id = NEW.id
        AND d.deleted_at IS NULL
    )
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_payment_amount_on_support_change() OWNER TO bhxh_system_user;

--
-- TOC entry 286 (class 1255 OID 16401)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: bhxh_system_user
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO bhxh_system_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 16862)
-- Name: adjustment_requests; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.adjustment_requests (
    id integer NOT NULL,
    note text NOT NULL,
    image_url text NOT NULL,
    public_id text,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    created_by integer NOT NULL,
    admin_note text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_urgent boolean DEFAULT false,
    adjustment_code character varying(50)
);


ALTER TABLE public.adjustment_requests OWNER TO bhxh_system_user;

--
-- TOC entry 231 (class 1259 OID 16861)
-- Name: adjustment_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.adjustment_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adjustment_requests_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3845 (class 0 OID 0)
-- Dependencies: 231
-- Name: adjustment_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.adjustment_requests_id_seq OWNED BY public.adjustment_requests.id;


--
-- TOC entry 230 (class 1259 OID 16791)
-- Name: adjustments; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.adjustments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    adjustment_type character varying(50) NOT NULL,
    current_info text NOT NULL,
    requested_change text NOT NULL,
    reason text NOT NULL,
    images text[] DEFAULT '{}'::text[],
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    admin_note text,
    processed_by integer,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.adjustments OWNER TO bhxh_system_user;

--
-- TOC entry 229 (class 1259 OID 16790)
-- Name: adjustments_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.adjustments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.adjustments_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3846 (class 0 OID 0)
-- Dependencies: 229
-- Name: adjustments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.adjustments_id_seq OWNED BY public.adjustments.id;


--
-- TOC entry 267 (class 1259 OID 17685)
-- Name: bien_lai; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.bien_lai (
    id integer NOT NULL,
    quyen_so character varying(50) NOT NULL,
    so_bien_lai character varying(50) NOT NULL,
    ten_nguoi_dong character varying(200) NOT NULL,
    so_tien numeric(18,2) NOT NULL,
    ghi_chu character varying(500),
    trang_thai character varying(20) DEFAULT 'active'::character varying NOT NULL,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ke_khai_bhyt_id integer NOT NULL,
    ma_so_bhxh character varying(10) NOT NULL,
    ma_nhan_vien character varying(50) NOT NULL,
    ngay_bien_lai timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tinh_chat text DEFAULT 'bien_lai_goc'::text NOT NULL,
    ma_co_quan_bhxh character varying(20) DEFAULT ''::character varying NOT NULL,
    ma_so_bhxh_don_vi character varying(10) NOT NULL,
    is_bhyt boolean DEFAULT false,
    is_bhxh boolean DEFAULT false,
    CONSTRAINT check_tinh_chat CHECK ((tinh_chat = ANY (ARRAY['bien_lai_goc'::text, 'bien_lai_huy_bo'::text])))
);


ALTER TABLE public.bien_lai OWNER TO bhxh_system_user;

--
-- TOC entry 3847 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN bien_lai.ma_so_bhxh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.bien_lai.ma_so_bhxh IS 'Mã số BHXH của người đóng';


--
-- TOC entry 3848 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN bien_lai.ma_nhan_vien; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.bien_lai.ma_nhan_vien IS 'Mã nhân viên thu tiền';


--
-- TOC entry 3849 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN bien_lai.ngay_bien_lai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.bien_lai.ngay_bien_lai IS 'Ngày phát hành biên lai';


--
-- TOC entry 3850 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN bien_lai.tinh_chat; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.bien_lai.tinh_chat IS 'Tính chất biên lai: Biên lai gốc hoặc Biên lai hủy bỏ';


--
-- TOC entry 3851 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN bien_lai.ma_co_quan_bhxh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.bien_lai.ma_co_quan_bhxh IS 'Mã cơ quan BHXH';


--
-- TOC entry 3852 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN bien_lai.ma_so_bhxh_don_vi; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.bien_lai.ma_so_bhxh_don_vi IS 'Mã số BHXH của đơn vị';


--
-- TOC entry 3853 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN bien_lai.is_bhyt; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.bien_lai.is_bhyt IS 'Đánh dấu biên lai BHYT';


--
-- TOC entry 3854 (class 0 OID 0)
-- Dependencies: 267
-- Name: COLUMN bien_lai.is_bhxh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.bien_lai.is_bhxh IS 'Đánh dấu biên lai BHXH tự nguyện';


--
-- TOC entry 265 (class 1259 OID 17643)
-- Name: bien_lai_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.bien_lai_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bien_lai_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 266 (class 1259 OID 17684)
-- Name: bien_lai_id_seq1; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.bien_lai_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bien_lai_id_seq1 OWNER TO bhxh_system_user;

--
-- TOC entry 3855 (class 0 OID 0)
-- Dependencies: 266
-- Name: bien_lai_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.bien_lai_id_seq1 OWNED BY public.bien_lai.id;


--
-- TOC entry 246 (class 1259 OID 17109)
-- Name: dai_ly; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.dai_ly (
    id integer NOT NULL,
    ma character varying(20) NOT NULL,
    ten character varying(200) NOT NULL,
    dia_chi text,
    so_dien_thoai character varying(15),
    email character varying(100),
    nguoi_dai_dien character varying(100),
    trang_thai boolean DEFAULT true,
    ngay_tao timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    nguoi_tao character varying(50),
    ma_tinh character varying(2)
);


ALTER TABLE public.dai_ly OWNER TO bhxh_system_user;

--
-- TOC entry 3856 (class 0 OID 0)
-- Dependencies: 246
-- Name: COLUMN dai_ly.ma_tinh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dai_ly.ma_tinh IS 'Mã tỉnh/thành phố của đại lý';


--
-- TOC entry 264 (class 1259 OID 17577)
-- Name: dai_ly_don_vi; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.dai_ly_don_vi (
    id integer NOT NULL,
    dai_ly_id integer NOT NULL,
    don_vi_id integer NOT NULL,
    trang_thai boolean DEFAULT true,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nguoi_tao character varying(50)
);


ALTER TABLE public.dai_ly_don_vi OWNER TO bhxh_system_user;

--
-- TOC entry 263 (class 1259 OID 17576)
-- Name: dai_ly_don_vi_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.dai_ly_don_vi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dai_ly_don_vi_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3857 (class 0 OID 0)
-- Dependencies: 263
-- Name: dai_ly_don_vi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.dai_ly_don_vi_id_seq OWNED BY public.dai_ly_don_vi.id;


--
-- TOC entry 245 (class 1259 OID 17108)
-- Name: dai_ly_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.dai_ly_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dai_ly_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3858 (class 0 OID 0)
-- Dependencies: 245
-- Name: dai_ly_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.dai_ly_id_seq OWNED BY public.dai_ly.id;


--
-- TOC entry 215 (class 1259 OID 16402)
-- Name: declaration_batch; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.declaration_batch (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    batch_number integer NOT NULL,
    department_code character varying(50) NOT NULL,
    object_type character varying(10) NOT NULL,
    service_type character varying(10) NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    total_declarations integer DEFAULT 0,
    notes text,
    created_by integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    submitted_at timestamp without time zone,
    submitted_by integer,
    approved_by integer,
    approved_at timestamp without time zone,
    rejected_by integer,
    rejected_at timestamp without time zone,
    admin_notes text,
    total_amount numeric(12,2) DEFAULT 0,
    payment_date date,
    payment_amount numeric(12,2),
    payment_bill_url text,
    payment_status character varying(50) DEFAULT 'unpaid'::character varying,
    payment_verified_by integer,
    payment_verified_at timestamp without time zone,
    payment_notes text,
    deleted_at timestamp without time zone,
    deleted_by integer,
    support_amount numeric(15,2) DEFAULT 0,
    total_support_amount numeric(15,2) DEFAULT 0,
    file_code character varying(100),
    bill_image character varying(255),
    completed_at timestamp without time zone,
    CONSTRAINT check_payment_status CHECK (((payment_status)::text = ANY (ARRAY['unpaid'::text, 'paid'::text]))),
    CONSTRAINT check_status CHECK (((status)::text = ANY (ARRAY['pending'::text, 'submitted'::text, 'approved'::text, 'processing'::text, 'completed'::text, 'rejected'::text]))),
    CONSTRAINT declaration_batch_month_check CHECK (((month >= 1) AND (month <= 12))),
    CONSTRAINT declaration_batch_object_type_check CHECK (((object_type)::text = ANY (ARRAY[('HGD'::character varying)::text, ('DTTS'::character varying)::text, ('NLNN'::character varying)::text]))),
    CONSTRAINT declaration_batch_service_type_check CHECK (((service_type)::text = ANY (ARRAY[('BHYT'::character varying)::text, ('BHXH'::character varying)::text])))
);


ALTER TABLE public.declaration_batch OWNER TO bhxh_system_user;

--
-- TOC entry 216 (class 1259 OID 16420)
-- Name: declaration_batch_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.declaration_batch_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.declaration_batch_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3859 (class 0 OID 0)
-- Dependencies: 216
-- Name: declaration_batch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.declaration_batch_id_seq OWNED BY public.declaration_batch.id;


--
-- TOC entry 224 (class 1259 OID 16705)
-- Name: declarations; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.declarations (
    id integer NOT NULL,
    batch_id integer,
    unit_id integer,
    object_type character varying(50) DEFAULT 'import'::character varying,
    bhxh_code character varying(20),
    ho_ten character varying(100),
    ngay_sinh character varying(10),
    gioi_tinh character varying(10),
    so_cmnd character varying(20),
    so_dien_thoai character varying(20),
    email character varying(100),
    address text,
    "position" character varying(100),
    new_card_effective_date date,
    old_card_number character varying(50),
    old_card_issue_date date,
    old_card_expiry_date date,
    old_primary_care_facility character varying(200),
    old_primary_care_facility_code character varying(50),
    reason text,
    status character varying(20) DEFAULT 'pending'::character varying,
    rejection_reason text,
    amount numeric(10,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_by integer,
    approved_by integer,
    approved_at timestamp without time zone,
    rejected_by integer,
    rejected_at timestamp without time zone,
    deleted_at timestamp without time zone,
    sokcb character varying(50),
    user_id integer,
    ngay_bien_lai date,
    receipt_number character varying(20),
    participant_number character varying(10),
    months character varying(10),
    plan character varying(20),
    ten_tinh_nkq character varying(100),
    ten_huyen_nkq character varying(100),
    ten_xa_nkq character varying(100),
    hamlet character varying(100),
    hospital_code character varying(100),
    actual_amount numeric(15,2) DEFAULT 0,
    support_amount numeric(15,2) DEFAULT 0,
    total_amount numeric(15,2) DEFAULT 0,
    payment_status character varying(20) DEFAULT 'pending'::character varying,
    household_id integer,
    relationship_with_head character varying(50),
    new_card_expiry_date character varying(10),
    is_urgent boolean DEFAULT false,
    tenbenhvien character varying(200),
    "maDoiTuong" character varying(10),
    "tenXaKs" character varying(200),
    "tenHuyenKs" character varying(200),
    "tenTinhKs" character varying(200),
    "maCqbh" character varying(20),
    "ghiChu" text,
    "loaiDuLieu" character varying(20) DEFAULT 'NHAP_TAY'::character varying,
    "danToc" character varying(50),
    deleted_by integer,
    "quocTich" character varying(50),
    "maHoGiaDinh" character varying(50),
    "soTheBHYT" character varying(50),
    "phuongAn" character varying(50),
    "moTa" text,
    "maTinhKS" character varying(50),
    "maHuyenKS" character varying(50),
    "maXaKS" character varying(50),
    "maTinhNkq" character varying(50),
    "maHuyenNkq" character varying(50),
    "maXaNkq" character varying(50),
    "tinhKCB" character varying(50),
    "maBenhVien" character varying(50),
    "tuNgayTheCu" character varying(50),
    "denNgayTheCu" character varying(50),
    ccns character varying(50),
    "isThamGiaBb" integer DEFAULT 0,
    "noiNhanHoSo" character varying(255),
    "tenBenhVien" character varying(255),
    ten_benh_vien character varying(255)
);


ALTER TABLE public.declarations OWNER TO bhxh_system_user;

--
-- TOC entry 3860 (class 0 OID 0)
-- Dependencies: 224
-- Name: TABLE declarations; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.declarations IS 'Bảng lưu thông tin kê khai BHXH';


--
-- TOC entry 3861 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.so_cmnd; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.so_cmnd IS 'Số CCCD/CMND của người kê khai (có thể để trống)';


--
-- TOC entry 3862 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.actual_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.actual_amount IS 'Số tiền thực tế phải đóng';


--
-- TOC entry 3863 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.support_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.support_amount IS 'Số tiền hỗ trợ';


--
-- TOC entry 3864 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.total_amount; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.total_amount IS 'Tổng số tiền (actual_amount - support_amount)';


--
-- TOC entry 3865 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.payment_status; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.payment_status IS 'Trạng thái thanh toán';


--
-- TOC entry 3866 (class 0 OID 0)
-- Dependencies: 224
-- Name: COLUMN declarations.deleted_by; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.declarations.deleted_by IS 'ID của người thực hiện xóa mềm';


--
-- TOC entry 223 (class 1259 OID 16704)
-- Name: declarations_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.declarations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.declarations_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3867 (class 0 OID 0)
-- Dependencies: 223
-- Name: declarations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.declarations_id_seq OWNED BY public.declarations.id;


--
-- TOC entry 244 (class 1259 OID 17063)
-- Name: dich_vu; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.dich_vu (
    id integer NOT NULL,
    ten character varying(100) NOT NULL,
    ten_viet_tat character varying(10) NOT NULL,
    mo_ta text,
    trang_thai boolean DEFAULT true,
    ngay_tao timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    nguoi_tao character varying(50),
    ma_thu_tuc character varying(10)
);


ALTER TABLE public.dich_vu OWNER TO bhxh_system_user;

--
-- TOC entry 3868 (class 0 OID 0)
-- Dependencies: 244
-- Name: TABLE dich_vu; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.dich_vu IS 'Bảng quản lý các loại dịch vụ';


--
-- TOC entry 3869 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dich_vu.id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dich_vu.id IS 'ID dịch vụ';


--
-- TOC entry 3870 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dich_vu.ten; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dich_vu.ten IS 'Tên dịch vụ';


--
-- TOC entry 3871 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dich_vu.ten_viet_tat; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dich_vu.ten_viet_tat IS 'Tên viết tắt của dịch vụ';


--
-- TOC entry 3872 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dich_vu.mo_ta; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dich_vu.mo_ta IS 'Mô tả chi tiết về dịch vụ';


--
-- TOC entry 3873 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dich_vu.trang_thai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dich_vu.trang_thai IS 'Trạng thái hoạt động của dịch vụ';


--
-- TOC entry 3874 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dich_vu.ngay_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dich_vu.ngay_tao IS 'Ngày tạo dịch vụ';


--
-- TOC entry 3875 (class 0 OID 0)
-- Dependencies: 244
-- Name: COLUMN dich_vu.nguoi_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dich_vu.nguoi_tao IS 'Người tạo dịch vụ';


--
-- TOC entry 243 (class 1259 OID 17062)
-- Name: dich_vu_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.dich_vu_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dich_vu_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3876 (class 0 OID 0)
-- Dependencies: 243
-- Name: dich_vu_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.dich_vu_id_seq OWNED BY public.dich_vu.id;


--
-- TOC entry 252 (class 1259 OID 17164)
-- Name: dm_cskcb; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.dm_cskcb (
    id integer NOT NULL,
    value character varying(10) NOT NULL,
    text character varying(200) NOT NULL,
    ten character varying(200) NOT NULL,
    ma_tinh_kcb character varying(10),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dm_cskcb OWNER TO bhxh_system_user;

--
-- TOC entry 251 (class 1259 OID 17163)
-- Name: dm_cskcb_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.dm_cskcb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dm_cskcb_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3877 (class 0 OID 0)
-- Dependencies: 251
-- Name: dm_cskcb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.dm_cskcb_id_seq OWNED BY public.dm_cskcb.id;


--
-- TOC entry 254 (class 1259 OID 17249)
-- Name: dm_khoi_kcb; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.dm_khoi_kcb (
    id integer NOT NULL,
    ma_khoi_kcb character varying(10),
    ten_khoi_kcb character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.dm_khoi_kcb OWNER TO bhxh_system_user;

--
-- TOC entry 253 (class 1259 OID 17248)
-- Name: dm_khoi_kcb_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.dm_khoi_kcb_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dm_khoi_kcb_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3878 (class 0 OID 0)
-- Dependencies: 253
-- Name: dm_khoi_kcb_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.dm_khoi_kcb_id_seq OWNED BY public.dm_khoi_kcb.id;


--
-- TOC entry 256 (class 1259 OID 17258)
-- Name: don_vi; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.don_vi (
    id integer NOT NULL,
    ma_co_quan_bhxh character varying(10) NOT NULL,
    ma_so_bhxh character varying(10) NOT NULL,
    ten_don_vi character varying(255) NOT NULL,
    is_bhxhtn boolean DEFAULT false,
    is_bhyt boolean DEFAULT false,
    dm_khoi_kcb_id integer,
    type integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    trang_thai boolean DEFAULT true NOT NULL
);


ALTER TABLE public.don_vi OWNER TO bhxh_system_user;

--
-- TOC entry 255 (class 1259 OID 17257)
-- Name: don_vi_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.don_vi_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.don_vi_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3879 (class 0 OID 0)
-- Dependencies: 255
-- Name: don_vi_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.don_vi_id_seq OWNED BY public.don_vi.id;


--
-- TOC entry 242 (class 1259 OID 17035)
-- Name: dot_ke_khai; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.dot_ke_khai (
    id integer NOT NULL,
    ten_dot character varying(200) NOT NULL,
    so_dot integer NOT NULL,
    thang integer NOT NULL,
    nam integer NOT NULL,
    ghi_chu text,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nguoi_tao character varying(100),
    dich_vu character varying(255),
    trang_thai character varying(20) DEFAULT 'chua_gui'::character varying NOT NULL,
    don_vi_id integer,
    tong_so_tien numeric(18,2) DEFAULT 0,
    ma_ho_so character varying(50),
    tong_so_the integer DEFAULT 0,
    url_bill character varying(500),
    dai_ly_id integer,
    CONSTRAINT dot_ke_khai_nam_check CHECK ((nam >= 2000)),
    CONSTRAINT dot_ke_khai_thang_check CHECK (((thang >= 1) AND (thang <= 12)))
);


ALTER TABLE public.dot_ke_khai OWNER TO bhxh_system_user;

--
-- TOC entry 3880 (class 0 OID 0)
-- Dependencies: 242
-- Name: TABLE dot_ke_khai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.dot_ke_khai IS 'Bảng lưu trữ thông tin đợt kê khai';


--
-- TOC entry 3881 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.id IS 'ID đợt kê khai';


--
-- TOC entry 3882 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.ten_dot; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.ten_dot IS 'Tên đợt kê khai';


--
-- TOC entry 3883 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.so_dot; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.so_dot IS 'Số đợt kê khai';


--
-- TOC entry 3884 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.thang; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.thang IS 'Tháng kê khai (1-12)';


--
-- TOC entry 3885 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.nam; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.nam IS 'Năm kê khai';


--
-- TOC entry 3886 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.ghi_chu; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.ghi_chu IS 'Ghi chú cho đợt kê khai';


--
-- TOC entry 3887 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.ngay_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.ngay_tao IS 'Ngày tạo đợt kê khai';


--
-- TOC entry 3888 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.nguoi_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.nguoi_tao IS 'Người tạo đợt kê khai';


--
-- TOC entry 3889 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.trang_thai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.trang_thai IS 'Trạng thái đợt kê khai:
- chua_gui: Chưa gửi
- da_gui: Đã gửi
- cho_thanh_toan: Chờ thanh toán
- hoan_thanh: Hoàn thành
- tu_choi: Từ chối';


--
-- TOC entry 3890 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.don_vi_id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.don_vi_id IS 'ID đơn vị kê khai';


--
-- TOC entry 3891 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.url_bill; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.url_bill IS 'URL hóa đơn thanh toán';


--
-- TOC entry 3892 (class 0 OID 0)
-- Dependencies: 242
-- Name: COLUMN dot_ke_khai.dai_ly_id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.dot_ke_khai.dai_ly_id IS 'ID đại lý quản lý đợt kê khai';


--
-- TOC entry 241 (class 1259 OID 17034)
-- Name: dot_ke_khai_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.dot_ke_khai_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.dot_ke_khai_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3893 (class 0 OID 0)
-- Dependencies: 241
-- Name: dot_ke_khai_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.dot_ke_khai_id_seq OWNED BY public.dot_ke_khai.id;


--
-- TOC entry 238 (class 1259 OID 16984)
-- Name: ds_huyen; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.ds_huyen (
    id integer NOT NULL,
    ma character varying(3) NOT NULL,
    ten character varying(100) NOT NULL,
    text character varying(100) NOT NULL,
    ma_tinh character varying(2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ds_huyen OWNER TO bhxh_system_user;

--
-- TOC entry 237 (class 1259 OID 16983)
-- Name: ds_huyen_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.ds_huyen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ds_huyen_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3894 (class 0 OID 0)
-- Dependencies: 237
-- Name: ds_huyen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.ds_huyen_id_seq OWNED BY public.ds_huyen.id;


--
-- TOC entry 236 (class 1259 OID 16963)
-- Name: ds_tinh; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.ds_tinh (
    id integer NOT NULL,
    ma character varying(2) NOT NULL,
    ten character varying(100) NOT NULL,
    text character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ds_tinh OWNER TO bhxh_system_user;

--
-- TOC entry 235 (class 1259 OID 16962)
-- Name: ds_tinh_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.ds_tinh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ds_tinh_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3895 (class 0 OID 0)
-- Dependencies: 235
-- Name: ds_tinh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.ds_tinh_id_seq OWNED BY public.ds_tinh.id;


--
-- TOC entry 240 (class 1259 OID 17001)
-- Name: ds_xa; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.ds_xa (
    id integer NOT NULL,
    ma character varying(5),
    ten character varying(100) NOT NULL,
    text character varying(100) NOT NULL,
    ma_huyen character varying(3) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.ds_xa OWNER TO bhxh_system_user;

--
-- TOC entry 239 (class 1259 OID 17000)
-- Name: ds_xa_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.ds_xa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ds_xa_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3896 (class 0 OID 0)
-- Dependencies: 239
-- Name: ds_xa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.ds_xa_id_seq OWNED BY public.ds_xa.id;


--
-- TOC entry 258 (class 1259 OID 17299)
-- Name: hoa_don_thanh_toan; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.hoa_don_thanh_toan (
    id integer NOT NULL,
    dot_ke_khai_id integer NOT NULL,
    ngay_thanh_toan timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    so_tien numeric(15,2) DEFAULT 0 NOT NULL,
    noi_dung_thanh_toan text NOT NULL,
    url_bill text,
    public_id text,
    trang_thai character varying(50) DEFAULT 'cho_duyet'::character varying NOT NULL,
    nguoi_tao character varying(50) NOT NULL,
    ngay_tao timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    nguoi_duyet character varying(50),
    ngay_duyet timestamp with time zone,
    ghi_chu text,
    deleted_at timestamp with time zone,
    deleted_by integer,
    CONSTRAINT check_trang_thai CHECK (((trang_thai)::text = ANY ((ARRAY['cho_duyet'::character varying, 'da_duyet'::character varying, 'tu_choi'::character varying])::text[])))
);


ALTER TABLE public.hoa_don_thanh_toan OWNER TO bhxh_system_user;

--
-- TOC entry 3897 (class 0 OID 0)
-- Dependencies: 258
-- Name: TABLE hoa_don_thanh_toan; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.hoa_don_thanh_toan IS 'Bảng lưu thông tin hóa đơn thanh toán';


--
-- TOC entry 3898 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.id IS 'ID tự tăng';


--
-- TOC entry 3899 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.dot_ke_khai_id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.dot_ke_khai_id IS 'ID đợt kê khai';


--
-- TOC entry 3900 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.ngay_thanh_toan; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.ngay_thanh_toan IS 'Ngày thanh toán';


--
-- TOC entry 3901 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.so_tien; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.so_tien IS 'Số tiền thanh toán';


--
-- TOC entry 3902 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.noi_dung_thanh_toan; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.noi_dung_thanh_toan IS 'Nội dung thanh toán';


--
-- TOC entry 3903 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.url_bill; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.url_bill IS 'URL hóa đơn trên Cloudinary';


--
-- TOC entry 3904 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.public_id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.public_id IS 'Public ID trên Cloudinary';


--
-- TOC entry 3905 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.trang_thai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.trang_thai IS 'Trạng thái: cho_duyet, da_duyet, tu_choi';


--
-- TOC entry 3906 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.nguoi_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.nguoi_tao IS 'Người tạo hóa đơn';


--
-- TOC entry 3907 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.ngay_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.ngay_tao IS 'Ngày tạo hóa đơn';


--
-- TOC entry 3908 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.nguoi_duyet; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.nguoi_duyet IS 'Người duyệt hóa đơn';


--
-- TOC entry 3909 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.ngay_duyet; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.ngay_duyet IS 'Ngày duyệt hóa đơn';


--
-- TOC entry 3910 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.ghi_chu; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.ghi_chu IS 'Ghi chú';


--
-- TOC entry 3911 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.deleted_at; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.deleted_at IS 'Thời gian xóa mềm';


--
-- TOC entry 3912 (class 0 OID 0)
-- Dependencies: 258
-- Name: COLUMN hoa_don_thanh_toan.deleted_by; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.hoa_don_thanh_toan.deleted_by IS 'Người thực hiện xóa mềm';


--
-- TOC entry 257 (class 1259 OID 17298)
-- Name: hoa_don_thanh_toan_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.hoa_don_thanh_toan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hoa_don_thanh_toan_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3913 (class 0 OID 0)
-- Dependencies: 257
-- Name: hoa_don_thanh_toan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.hoa_don_thanh_toan_id_seq OWNED BY public.hoa_don_thanh_toan.id;


--
-- TOC entry 226 (class 1259 OID 16743)
-- Name: households; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.households (
    id integer NOT NULL,
    household_code character varying(50) NOT NULL,
    household_head character varying(100) NOT NULL,
    address text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.households OWNER TO bhxh_system_user;

--
-- TOC entry 225 (class 1259 OID 16742)
-- Name: households_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.households_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.households_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3914 (class 0 OID 0)
-- Dependencies: 225
-- Name: households_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.households_id_seq OWNED BY public.households.id;


--
-- TOC entry 270 (class 1259 OID 17800)
-- Name: ke_khai_bhxh; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.ke_khai_bhxh (
    id integer NOT NULL,
    dot_ke_khai_id integer NOT NULL,
    thong_tin_the_id integer NOT NULL,
    muc_thu_nhap numeric(15,2) NOT NULL,
    ty_le_dong numeric(5,2) DEFAULT 22 NOT NULL,
    ty_le_nsnn numeric(5,2) DEFAULT 10,
    loai_nsnn character varying(20) DEFAULT 'khac'::character varying,
    tien_ho_tro numeric(15,2) DEFAULT 0,
    so_tien_phai_dong numeric(15,2) DEFAULT 0 NOT NULL,
    phuong_thuc_dong integer DEFAULT 1 NOT NULL,
    thang_bat_dau date NOT NULL,
    tu_thang date,
    so_thang_dong integer GENERATED ALWAYS AS (
CASE
    WHEN (phuong_thuc_dong = ANY (ARRAY[1, 3, 6, 12])) THEN phuong_thuc_dong
    ELSE 1
END) STORED,
    phuong_an character varying(10) DEFAULT 'TM'::character varying NOT NULL,
    loai_khai_bao character varying(20) DEFAULT '1'::character varying,
    ngay_bien_lai date DEFAULT CURRENT_DATE,
    so_bien_lai character varying(20),
    quyen_bien_lai_id integer,
    ghi_chu text,
    nguoi_tao character varying(50) NOT NULL,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_urgent boolean DEFAULT false NOT NULL,
    trang_thai character varying(50) DEFAULT 'chua_gui'::character varying NOT NULL,
    CONSTRAINT ke_khai_bhxh_phuong_an_check CHECK (((phuong_an)::text = ANY ((ARRAY['TM'::character varying, 'DT'::character varying, 'DB'::character varying, 'DL'::character varying, 'GH'::character varying])::text[]))),
    CONSTRAINT ke_khai_bhxh_phuong_thuc_dong_check CHECK (((phuong_thuc_dong = ANY (ARRAY[1, 3, 6, 12])) OR ((phuong_thuc_dong)::text = ANY (ARRAY['VS'::text, 'TH'::text]))))
);


ALTER TABLE public.ke_khai_bhxh OWNER TO bhxh_system_user;

--
-- TOC entry 3915 (class 0 OID 0)
-- Dependencies: 270
-- Name: TABLE ke_khai_bhxh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.ke_khai_bhxh IS 'Bảng lưu thông tin kê khai BHXH tự nguyện';


--
-- TOC entry 3916 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.id IS 'ID tự tăng';


--
-- TOC entry 3917 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.dot_ke_khai_id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.dot_ke_khai_id IS 'ID đợt kê khai';


--
-- TOC entry 3918 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.thong_tin_the_id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.thong_tin_the_id IS 'ID thông tin thẻ (liên kết đến thông tin cá nhân)';


--
-- TOC entry 3919 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.muc_thu_nhap; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.muc_thu_nhap IS 'Mức thu nhập đóng BHXH';


--
-- TOC entry 3920 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.ty_le_dong; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.ty_le_dong IS 'Tỷ lệ đóng BHXH (%)';


--
-- TOC entry 3921 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.ty_le_nsnn; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.ty_le_nsnn IS 'Tỷ lệ hỗ trợ từ ngân sách nhà nước (%)';


--
-- TOC entry 3922 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.loai_nsnn; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.loai_nsnn IS 'Loại hỗ trợ NSNN (ngheo/can_ngheo/khac)';


--
-- TOC entry 3923 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.tien_ho_tro; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.tien_ho_tro IS 'Số tiền được hỗ trợ';


--
-- TOC entry 3924 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.so_tien_phai_dong; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.so_tien_phai_dong IS 'Số tiền phải đóng thực tế';


--
-- TOC entry 3925 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.phuong_thuc_dong; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.phuong_thuc_dong IS 'Phương thức đóng (1, 3, 6, 12 tháng hoặc VS, TH)';


--
-- TOC entry 3926 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.thang_bat_dau; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.thang_bat_dau IS 'Tháng bắt đầu tham gia BHXH';


--
-- TOC entry 3927 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.tu_thang; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.tu_thang IS 'Từ tháng';


--
-- TOC entry 3928 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.so_thang_dong; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.so_thang_dong IS 'Số tháng đóng (tính tự động từ phương thức đóng)';


--
-- TOC entry 3929 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.phuong_an; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.phuong_an IS 'Phương án đóng BHXH (TM, DT, DB, DL, GH)';


--
-- TOC entry 3930 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.loai_khai_bao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.loai_khai_bao IS 'Loại khai báo';


--
-- TOC entry 3931 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.ngay_bien_lai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.ngay_bien_lai IS 'Ngày biên lai (chỉ lưu ngày)';


--
-- TOC entry 3932 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.so_bien_lai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.so_bien_lai IS 'Số biên lai';


--
-- TOC entry 3933 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.ghi_chu; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.ghi_chu IS 'Ghi chú thêm về kê khai BHXH';


--
-- TOC entry 3934 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.nguoi_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.nguoi_tao IS 'Người tạo kê khai BHXH';


--
-- TOC entry 3935 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.is_urgent; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.is_urgent IS 'Đánh dấu kê khai cần xử lý gấp';


--
-- TOC entry 3936 (class 0 OID 0)
-- Dependencies: 270
-- Name: COLUMN ke_khai_bhxh.trang_thai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhxh.trang_thai IS 'Trạng thái kê khai (chua_gui, da_gui, cho_thanh_toan, da_duyet, tu_choi)';


--
-- TOC entry 271 (class 1259 OID 17822)
-- Name: ke_khai_bhxh_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.ke_khai_bhxh_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ke_khai_bhxh_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3937 (class 0 OID 0)
-- Dependencies: 271
-- Name: ke_khai_bhxh_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.ke_khai_bhxh_id_seq OWNED BY public.ke_khai_bhxh.id;


--
-- TOC entry 250 (class 1259 OID 17140)
-- Name: ke_khai_bhyt; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.ke_khai_bhyt (
    id integer NOT NULL,
    dot_ke_khai_id integer NOT NULL,
    thong_tin_the_id integer NOT NULL,
    nguoi_thu integer NOT NULL,
    so_thang_dong integer NOT NULL,
    phuong_an_dong character varying(50) NOT NULL,
    han_the_cu date,
    han_the_moi_tu date NOT NULL,
    han_the_moi_den date NOT NULL,
    tinh_nkq character varying(50) NOT NULL,
    huyen_nkq character varying(50) NOT NULL,
    xa_nkq character varying(50) NOT NULL,
    dia_chi_nkq character varying(200) NOT NULL,
    benh_vien_kcb character varying(200) NOT NULL,
    nguoi_tao character varying(50) NOT NULL,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ngay_bien_lai date,
    so_tien_can_dong numeric(15,2) DEFAULT 0 NOT NULL,
    is_urgent boolean DEFAULT false NOT NULL,
    trang_thai character varying(50) DEFAULT 'chua_gui'::character varying NOT NULL,
    so_bien_lai character varying(20),
    quyen_bien_lai_id integer
);


ALTER TABLE public.ke_khai_bhyt OWNER TO bhxh_system_user;

--
-- TOC entry 3938 (class 0 OID 0)
-- Dependencies: 250
-- Name: TABLE ke_khai_bhyt; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.ke_khai_bhyt IS 'Bảng lưu thông tin kê khai BHYT thường xuyên thay đổi';


--
-- TOC entry 3939 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.id IS 'ID tự tăng';


--
-- TOC entry 3940 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.dot_ke_khai_id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.dot_ke_khai_id IS 'ID đợt kê khai';


--
-- TOC entry 3941 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.thong_tin_the_id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.thong_tin_the_id IS 'ID thông tin thẻ';


--
-- TOC entry 3942 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.nguoi_thu; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.nguoi_thu IS 'Người thứ';


--
-- TOC entry 3943 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.so_thang_dong; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.so_thang_dong IS 'Số tháng đóng';


--
-- TOC entry 3944 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.phuong_an_dong; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.phuong_an_dong IS 'Phương án đóng';


--
-- TOC entry 3945 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.han_the_cu; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.han_the_cu IS 'Hạn thẻ cũ';


--
-- TOC entry 3946 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.han_the_moi_tu; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.han_the_moi_tu IS 'Hạn thẻ mới từ ngày';


--
-- TOC entry 3947 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.han_the_moi_den; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.han_the_moi_den IS 'Hạn thẻ mới đến ngày';


--
-- TOC entry 3948 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.tinh_nkq; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.tinh_nkq IS 'Tỉnh nơi khám chữa bệnh';


--
-- TOC entry 3949 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.huyen_nkq; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.huyen_nkq IS 'Huyện nơi khám chữa bệnh';


--
-- TOC entry 3950 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.xa_nkq; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.xa_nkq IS 'Xã nơi khám chữa bệnh';


--
-- TOC entry 3951 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.dia_chi_nkq; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.dia_chi_nkq IS 'Địa chỉ nơi khám chữa bệnh';


--
-- TOC entry 3952 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.benh_vien_kcb; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.benh_vien_kcb IS 'Bệnh viện khám chữa bệnh ban đầu';


--
-- TOC entry 3953 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.nguoi_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.nguoi_tao IS 'Người tạo';


--
-- TOC entry 3954 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.ngay_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.ngay_tao IS 'Ngày tạo';


--
-- TOC entry 3955 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.ngay_bien_lai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.ngay_bien_lai IS 'Ngày biên lai (chỉ lưu ngày)';


--
-- TOC entry 3956 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.so_tien_can_dong; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.so_tien_can_dong IS 'Số tiền cần đóng BHYT';


--
-- TOC entry 3957 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.is_urgent; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.is_urgent IS 'Đánh dấu kê khai cần xử lý gấp';


--
-- TOC entry 3958 (class 0 OID 0)
-- Dependencies: 250
-- Name: COLUMN ke_khai_bhyt.so_bien_lai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.ke_khai_bhyt.so_bien_lai IS 'Số biên lai của kê khai BHYT';


--
-- TOC entry 249 (class 1259 OID 17139)
-- Name: ke_khai_bhyt_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.ke_khai_bhyt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ke_khai_bhyt_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3959 (class 0 OID 0)
-- Dependencies: 249
-- Name: ke_khai_bhyt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.ke_khai_bhyt_id_seq OWNED BY public.ke_khai_bhyt.id;


--
-- TOC entry 262 (class 1259 OID 17371)
-- Name: nguoi_dung; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.nguoi_dung (
    id integer NOT NULL,
    user_name character varying(50) NOT NULL,
    ho_ten character varying(100) NOT NULL,
    don_vi_cong_tac character varying(200),
    chuc_danh character varying(100),
    email character varying(100),
    so_dien_thoai character varying(20),
    is_super_admin boolean DEFAULT false,
    type_mang_luoi integer,
    user_id integer,
    status integer DEFAULT 1,
    client_id character varying(100),
    roles text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password character varying(100) NOT NULL,
    ma_nhan_vien character varying(20)
);


ALTER TABLE public.nguoi_dung OWNER TO bhxh_system_user;

--
-- TOC entry 3960 (class 0 OID 0)
-- Dependencies: 262
-- Name: TABLE nguoi_dung; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.nguoi_dung IS 'Bảng lưu thông tin người dùng trong hệ thống';


--
-- TOC entry 3961 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.id IS 'Khóa chính tự tăng';


--
-- TOC entry 3962 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.user_name; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.user_name IS 'Tên đăng nhập của người dùng';


--
-- TOC entry 3963 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.ho_ten; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.ho_ten IS 'Họ và tên người dùng';


--
-- TOC entry 3964 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.don_vi_cong_tac; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.don_vi_cong_tac IS 'Đơn vị công tác';


--
-- TOC entry 3965 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.chuc_danh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.chuc_danh IS 'Chức danh';


--
-- TOC entry 3966 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.email; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.email IS 'Địa chỉ email';


--
-- TOC entry 3967 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.so_dien_thoai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.so_dien_thoai IS 'Số điện thoại';


--
-- TOC entry 3968 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.is_super_admin; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.is_super_admin IS 'Quyền super admin';


--
-- TOC entry 3969 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.type_mang_luoi; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.type_mang_luoi IS 'Loại mạng lưới';


--
-- TOC entry 3970 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.status; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.status IS 'Trạng thái người dùng';


--
-- TOC entry 3971 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.roles; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.roles IS 'Mảng các role của người dùng';


--
-- TOC entry 3972 (class 0 OID 0)
-- Dependencies: 262
-- Name: COLUMN nguoi_dung.ma_nhan_vien; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.nguoi_dung.ma_nhan_vien IS 'Mã nhân viên của người dùng';


--
-- TOC entry 261 (class 1259 OID 17370)
-- Name: nguoi_dung_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.nguoi_dung_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nguoi_dung_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3973 (class 0 OID 0)
-- Dependencies: 261
-- Name: nguoi_dung_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.nguoi_dung_id_seq OWNED BY public.nguoi_dung.id;


--
-- TOC entry 228 (class 1259 OID 16772)
-- Name: notifications; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    type character varying(50) DEFAULT 'info'::character varying,
    is_read boolean DEFAULT false,
    link character varying(255),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['info'::character varying, 'success'::character varying, 'warning'::character varying, 'error'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO bhxh_system_user;

--
-- TOC entry 227 (class 1259 OID 16771)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3974 (class 0 OID 0)
-- Dependencies: 227
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 217 (class 1259 OID 16453)
-- Name: payment_bills; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.payment_bills (
    id integer NOT NULL,
    batch_id integer,
    file_url character varying(500),
    cloudinary_public_id character varying(255),
    uploaded_by integer,
    uploaded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payment_bills OWNER TO bhxh_system_user;

--
-- TOC entry 218 (class 1259 OID 16459)
-- Name: payment_bills_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.payment_bills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_bills_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3975 (class 0 OID 0)
-- Dependencies: 218
-- Name: payment_bills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.payment_bills_id_seq OWNED BY public.payment_bills.id;


--
-- TOC entry 269 (class 1259 OID 17702)
-- Name: quyen_bien_lai; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.quyen_bien_lai (
    id integer NOT NULL,
    quyen_so character varying(20) NOT NULL,
    tu_so character varying(20) NOT NULL,
    den_so character varying(20) NOT NULL,
    nhan_vien_thu integer NOT NULL,
    ngay_cap timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    nguoi_cap character varying(50) NOT NULL,
    trang_thai character varying(20) DEFAULT 'chua_su_dung'::character varying NOT NULL,
    so_hien_tai character varying(20)
);


ALTER TABLE public.quyen_bien_lai OWNER TO bhxh_system_user;

--
-- TOC entry 268 (class 1259 OID 17701)
-- Name: quyen_bien_lai_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.quyen_bien_lai_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quyen_bien_lai_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3976 (class 0 OID 0)
-- Dependencies: 268
-- Name: quyen_bien_lai_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.quyen_bien_lai_id_seq OWNED BY public.quyen_bien_lai.id;


--
-- TOC entry 234 (class 1259 OID 16946)
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by_ip character varying(45),
    revoked_at timestamp without time zone,
    revoked_by_ip character varying(45),
    replaced_by_token character varying(255),
    reason_revoked character varying(255)
);


ALTER TABLE public.refresh_tokens OWNER TO bhxh_system_user;

--
-- TOC entry 233 (class 1259 OID 16945)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.refresh_tokens_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3977 (class 0 OID 0)
-- Dependencies: 233
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- TOC entry 260 (class 1259 OID 17350)
-- Name: thanh_toan; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.thanh_toan (
    id integer NOT NULL,
    dot_ke_khai_id integer NOT NULL,
    file_url character varying(500) NOT NULL,
    cloudinary_public_id character varying(255),
    nguoi_tao character varying(100) NOT NULL,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.thanh_toan OWNER TO bhxh_system_user;

--
-- TOC entry 259 (class 1259 OID 17349)
-- Name: thanh_toan_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.thanh_toan_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thanh_toan_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3978 (class 0 OID 0)
-- Dependencies: 259
-- Name: thanh_toan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.thanh_toan_id_seq OWNED BY public.thanh_toan.id;


--
-- TOC entry 248 (class 1259 OID 17128)
-- Name: thong_tin_the; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.thong_tin_the (
    id integer NOT NULL,
    ma_so_bhxh character varying(13) NOT NULL,
    cccd character varying(12) NOT NULL,
    ho_ten character varying(100) NOT NULL,
    ngay_sinh character varying(50) NOT NULL,
    gioi_tinh character varying(10) NOT NULL,
    so_dien_thoai character varying(15) NOT NULL,
    nguoi_tao character varying(50) NOT NULL,
    ngay_tao timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    ma_hgd character varying(10),
    ma_tinh_ks character varying(50),
    ma_huyen_ks character varying(50),
    ma_xa_ks character varying(50),
    ma_tinh_nkq character varying(50),
    ma_huyen_nkq character varying(50),
    ma_xa_nkq character varying(50),
    so_the_bhyt character varying(15),
    ma_dan_toc character varying(50),
    quoc_tich character varying(50),
    ma_benh_vien character varying(50)
);


ALTER TABLE public.thong_tin_the OWNER TO bhxh_system_user;

--
-- TOC entry 3979 (class 0 OID 0)
-- Dependencies: 248
-- Name: TABLE thong_tin_the; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON TABLE public.thong_tin_the IS 'Bảng lưu thông tin thẻ BHYT ít thay đổi';


--
-- TOC entry 3980 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.id; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.id IS 'ID tự tăng';


--
-- TOC entry 3981 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.ma_so_bhxh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.ma_so_bhxh IS 'Mã số BHXH';


--
-- TOC entry 3982 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.cccd; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.cccd IS 'Số CCCD';


--
-- TOC entry 3983 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.ho_ten; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.ho_ten IS 'Họ và tên';


--
-- TOC entry 3984 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.ngay_sinh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.ngay_sinh IS 'Định dạng: YYYY hoặc dd/MM/yyyy';


--
-- TOC entry 3985 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.gioi_tinh; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.gioi_tinh IS 'Giới tính (true: Nam, false: Nữ)';


--
-- TOC entry 3986 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.so_dien_thoai; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.so_dien_thoai IS 'Số điện thoại';


--
-- TOC entry 3987 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.nguoi_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.nguoi_tao IS 'Người tạo';


--
-- TOC entry 3988 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.ngay_tao; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.ngay_tao IS 'Ngày tạo';


--
-- TOC entry 3989 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.ma_hgd; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.ma_hgd IS 'Mã hộ gia đình từ BHXH';


--
-- TOC entry 3990 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.so_the_bhyt; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.so_the_bhyt IS 'Số thẻ BHYT';


--
-- TOC entry 3991 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.ma_dan_toc; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.ma_dan_toc IS 'Mã dân tộc';


--
-- TOC entry 3992 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.quoc_tich; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.quoc_tich IS 'Quốc tịch';


--
-- TOC entry 3993 (class 0 OID 0)
-- Dependencies: 248
-- Name: COLUMN thong_tin_the.ma_benh_vien; Type: COMMENT; Schema: public; Owner: bhxh_system_user
--

COMMENT ON COLUMN public.thong_tin_the.ma_benh_vien IS 'Mã bệnh viện';


--
-- TOC entry 247 (class 1259 OID 17127)
-- Name: thong_tin_the_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.thong_tin_the_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.thong_tin_the_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3994 (class 0 OID 0)
-- Dependencies: 247
-- Name: thong_tin_the_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.thong_tin_the_id_seq OWNED BY public.thong_tin_the.id;


--
-- TOC entry 219 (class 1259 OID 16460)
-- Name: units; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.units (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.units OWNER TO bhxh_system_user;

--
-- TOC entry 220 (class 1259 OID 16468)
-- Name: units_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.units_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.units_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3995 (class 0 OID 0)
-- Dependencies: 220
-- Name: units_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.units_id_seq OWNED BY public.units.id;


--
-- TOC entry 221 (class 1259 OID 16469)
-- Name: users; Type: TABLE; Schema: public; Owner: bhxh_system_user
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(100) NOT NULL,
    ho_ten character varying(100),
    email character varying(100),
    so_dien_thoai character varying(15),
    role character varying(20),
    department_code character varying(50),
    unit character varying(100),
    unit_id integer,
    status character varying(20) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    province character varying(50),
    district character varying(50),
    commune character varying(50),
    hamlet character varying(50),
    address text,
    last_login_at timestamp with time zone,
    first_login boolean DEFAULT true,
    password_changed boolean DEFAULT false,
    deleted_at timestamp without time zone,
    last_login_ip character varying(45),
    last_login_location text,
    dai_ly_id integer,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['admin'::character varying, 'employee'::character varying, 'bhxh'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO bhxh_system_user;

--
-- TOC entry 222 (class 1259 OID 16478)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: bhxh_system_user
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO bhxh_system_user;

--
-- TOC entry 3996 (class 0 OID 0)
-- Dependencies: 222
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: bhxh_system_user
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3398 (class 2604 OID 16865)
-- Name: adjustment_requests id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests ALTER COLUMN id SET DEFAULT nextval('public.adjustment_requests_id_seq'::regclass);


--
-- TOC entry 3393 (class 2604 OID 16794)
-- Name: adjustments id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments ALTER COLUMN id SET DEFAULT nextval('public.adjustments_id_seq'::regclass);


--
-- TOC entry 3455 (class 2604 OID 17688)
-- Name: bien_lai id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.bien_lai ALTER COLUMN id SET DEFAULT nextval('public.bien_lai_id_seq1'::regclass);


--
-- TOC entry 3419 (class 2604 OID 17112)
-- Name: dai_ly id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dai_ly ALTER COLUMN id SET DEFAULT nextval('public.dai_ly_id_seq'::regclass);


--
-- TOC entry 3452 (class 2604 OID 17580)
-- Name: dai_ly_don_vi id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dai_ly_don_vi ALTER COLUMN id SET DEFAULT nextval('public.dai_ly_don_vi_id_seq'::regclass);


--
-- TOC entry 3351 (class 2604 OID 16479)
-- Name: declaration_batch id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch ALTER COLUMN id SET DEFAULT nextval('public.declaration_batch_id_seq'::regclass);


--
-- TOC entry 3372 (class 2604 OID 16708)
-- Name: declarations id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations ALTER COLUMN id SET DEFAULT nextval('public.declarations_id_seq'::regclass);


--
-- TOC entry 3416 (class 2604 OID 17066)
-- Name: dich_vu id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dich_vu ALTER COLUMN id SET DEFAULT nextval('public.dich_vu_id_seq'::regclass);


--
-- TOC entry 3429 (class 2604 OID 17167)
-- Name: dm_cskcb id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dm_cskcb ALTER COLUMN id SET DEFAULT nextval('public.dm_cskcb_id_seq'::regclass);


--
-- TOC entry 3431 (class 2604 OID 17252)
-- Name: dm_khoi_kcb id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dm_khoi_kcb ALTER COLUMN id SET DEFAULT nextval('public.dm_khoi_kcb_id_seq'::regclass);


--
-- TOC entry 3434 (class 2604 OID 17261)
-- Name: don_vi id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.don_vi ALTER COLUMN id SET DEFAULT nextval('public.don_vi_id_seq'::regclass);


--
-- TOC entry 3411 (class 2604 OID 17038)
-- Name: dot_ke_khai id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai ALTER COLUMN id SET DEFAULT nextval('public.dot_ke_khai_id_seq'::regclass);


--
-- TOC entry 3407 (class 2604 OID 16987)
-- Name: ds_huyen id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_huyen ALTER COLUMN id SET DEFAULT nextval('public.ds_huyen_id_seq'::regclass);


--
-- TOC entry 3405 (class 2604 OID 16966)
-- Name: ds_tinh id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_tinh ALTER COLUMN id SET DEFAULT nextval('public.ds_tinh_id_seq'::regclass);


--
-- TOC entry 3409 (class 2604 OID 17004)
-- Name: ds_xa id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_xa ALTER COLUMN id SET DEFAULT nextval('public.ds_xa_id_seq'::regclass);


--
-- TOC entry 3440 (class 2604 OID 17302)
-- Name: hoa_don_thanh_toan id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.hoa_don_thanh_toan ALTER COLUMN id SET DEFAULT nextval('public.hoa_don_thanh_toan_id_seq'::regclass);


--
-- TOC entry 3385 (class 2604 OID 16746)
-- Name: households id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households ALTER COLUMN id SET DEFAULT nextval('public.households_id_seq'::regclass);


--
-- TOC entry 3466 (class 2604 OID 17823)
-- Name: ke_khai_bhxh id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhxh ALTER COLUMN id SET DEFAULT nextval('public.ke_khai_bhxh_id_seq'::regclass);


--
-- TOC entry 3424 (class 2604 OID 17143)
-- Name: ke_khai_bhyt id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhyt ALTER COLUMN id SET DEFAULT nextval('public.ke_khai_bhyt_id_seq'::regclass);


--
-- TOC entry 3447 (class 2604 OID 17374)
-- Name: nguoi_dung id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.nguoi_dung ALTER COLUMN id SET DEFAULT nextval('public.nguoi_dung_id_seq'::regclass);


--
-- TOC entry 3388 (class 2604 OID 16775)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 3360 (class 2604 OID 16483)
-- Name: payment_bills id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills ALTER COLUMN id SET DEFAULT nextval('public.payment_bills_id_seq'::regclass);


--
-- TOC entry 3463 (class 2604 OID 17705)
-- Name: quyen_bien_lai id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.quyen_bien_lai ALTER COLUMN id SET DEFAULT nextval('public.quyen_bien_lai_id_seq'::regclass);


--
-- TOC entry 3403 (class 2604 OID 16949)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 3445 (class 2604 OID 17353)
-- Name: thanh_toan id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.thanh_toan ALTER COLUMN id SET DEFAULT nextval('public.thanh_toan_id_seq'::regclass);


--
-- TOC entry 3422 (class 2604 OID 17131)
-- Name: thong_tin_the id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.thong_tin_the ALTER COLUMN id SET DEFAULT nextval('public.thong_tin_the_id_seq'::regclass);


--
-- TOC entry 3362 (class 2604 OID 16484)
-- Name: units id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units ALTER COLUMN id SET DEFAULT nextval('public.units_id_seq'::regclass);


--
-- TOC entry 3366 (class 2604 OID 16485)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3540 (class 2606 OID 16872)
-- Name: adjustment_requests adjustment_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests
    ADD CONSTRAINT adjustment_requests_pkey PRIMARY KEY (id);


--
-- TOC entry 3536 (class 2606 OID 16802)
-- Name: adjustments adjustments_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_pkey PRIMARY KEY (id);


--
-- TOC entry 3624 (class 2606 OID 17694)
-- Name: bien_lai bien_lai_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.bien_lai
    ADD CONSTRAINT bien_lai_pkey PRIMARY KEY (id);


--
-- TOC entry 3622 (class 2606 OID 17584)
-- Name: dai_ly_don_vi dai_ly_don_vi_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dai_ly_don_vi
    ADD CONSTRAINT dai_ly_don_vi_pkey PRIMARY KEY (id);


--
-- TOC entry 3578 (class 2606 OID 17120)
-- Name: dai_ly dai_ly_ma_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dai_ly
    ADD CONSTRAINT dai_ly_ma_key UNIQUE (ma);


--
-- TOC entry 3580 (class 2606 OID 17118)
-- Name: dai_ly dai_ly_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dai_ly
    ADD CONSTRAINT dai_ly_pkey PRIMARY KEY (id);


--
-- TOC entry 3494 (class 2606 OID 16487)
-- Name: declaration_batch declaration_batch_month_year_batch_number_department_code_o_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_month_year_batch_number_department_code_o_key UNIQUE (month, year, batch_number, department_code, object_type, service_type);


--
-- TOC entry 3496 (class 2606 OID 16489)
-- Name: declaration_batch declaration_batch_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_pkey PRIMARY KEY (id);


--
-- TOC entry 3498 (class 2606 OID 16491)
-- Name: declaration_batch declaration_batch_unique_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_unique_key UNIQUE (month, year, batch_number, department_code, object_type, service_type);


--
-- TOC entry 3522 (class 2606 OID 16717)
-- Name: declarations declarations_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_pkey PRIMARY KEY (id);


--
-- TOC entry 3574 (class 2606 OID 17072)
-- Name: dich_vu dich_vu_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dich_vu
    ADD CONSTRAINT dich_vu_pkey PRIMARY KEY (id);


--
-- TOC entry 3595 (class 2606 OID 17170)
-- Name: dm_cskcb dm_cskcb_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dm_cskcb
    ADD CONSTRAINT dm_cskcb_pkey PRIMARY KEY (id);


--
-- TOC entry 3597 (class 2606 OID 17172)
-- Name: dm_cskcb dm_cskcb_value_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dm_cskcb
    ADD CONSTRAINT dm_cskcb_value_key UNIQUE (value);


--
-- TOC entry 3601 (class 2606 OID 17256)
-- Name: dm_khoi_kcb dm_khoi_kcb_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dm_khoi_kcb
    ADD CONSTRAINT dm_khoi_kcb_pkey PRIMARY KEY (id);


--
-- TOC entry 3603 (class 2606 OID 17267)
-- Name: don_vi don_vi_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.don_vi
    ADD CONSTRAINT don_vi_pkey PRIMARY KEY (id);


--
-- TOC entry 3565 (class 2606 OID 17046)
-- Name: dot_ke_khai dot_ke_khai_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai
    ADD CONSTRAINT dot_ke_khai_pkey PRIMARY KEY (id);


--
-- TOC entry 3555 (class 2606 OID 16992)
-- Name: ds_huyen ds_huyen_ma_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_huyen
    ADD CONSTRAINT ds_huyen_ma_key UNIQUE (ma);


--
-- TOC entry 3557 (class 2606 OID 16990)
-- Name: ds_huyen ds_huyen_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_huyen
    ADD CONSTRAINT ds_huyen_pkey PRIMARY KEY (id);


--
-- TOC entry 3550 (class 2606 OID 16982)
-- Name: ds_tinh ds_tinh_ma_unique; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_tinh
    ADD CONSTRAINT ds_tinh_ma_unique UNIQUE (ma);


--
-- TOC entry 3552 (class 2606 OID 16969)
-- Name: ds_tinh ds_tinh_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_tinh
    ADD CONSTRAINT ds_tinh_pkey PRIMARY KEY (id);


--
-- TOC entry 3560 (class 2606 OID 17009)
-- Name: ds_xa ds_xa_ma_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_xa
    ADD CONSTRAINT ds_xa_ma_key UNIQUE (ma);


--
-- TOC entry 3562 (class 2606 OID 17007)
-- Name: ds_xa ds_xa_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_xa
    ADD CONSTRAINT ds_xa_pkey PRIMARY KEY (id);


--
-- TOC entry 3607 (class 2606 OID 17311)
-- Name: hoa_don_thanh_toan hoa_don_thanh_toan_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.hoa_don_thanh_toan
    ADD CONSTRAINT hoa_don_thanh_toan_pkey PRIMARY KEY (id);


--
-- TOC entry 3530 (class 2606 OID 16754)
-- Name: households households_household_code_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households
    ADD CONSTRAINT households_household_code_key UNIQUE (household_code);


--
-- TOC entry 3532 (class 2606 OID 16752)
-- Name: households households_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.households
    ADD CONSTRAINT households_pkey PRIMARY KEY (id);


--
-- TOC entry 3644 (class 2606 OID 17821)
-- Name: ke_khai_bhxh ke_khai_bhxh_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhxh
    ADD CONSTRAINT ke_khai_bhxh_pkey PRIMARY KEY (id);


--
-- TOC entry 3593 (class 2606 OID 17148)
-- Name: ke_khai_bhyt ke_khai_bhyt_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhyt
    ADD CONSTRAINT ke_khai_bhyt_pkey PRIMARY KEY (id);


--
-- TOC entry 3618 (class 2606 OID 17382)
-- Name: nguoi_dung nguoi_dung_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.nguoi_dung
    ADD CONSTRAINT nguoi_dung_pkey PRIMARY KEY (id);


--
-- TOC entry 3534 (class 2606 OID 16784)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3506 (class 2606 OID 16499)
-- Name: payment_bills payment_bills_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_pkey PRIMARY KEY (id);


--
-- TOC entry 3638 (class 2606 OID 17709)
-- Name: quyen_bien_lai quyen_bien_lai_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.quyen_bien_lai
    ADD CONSTRAINT quyen_bien_lai_pkey PRIMARY KEY (id);


--
-- TOC entry 3548 (class 2606 OID 16954)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 3613 (class 2606 OID 17358)
-- Name: thanh_toan thanh_toan_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.thanh_toan
    ADD CONSTRAINT thanh_toan_pkey PRIMARY KEY (id);


--
-- TOC entry 3585 (class 2606 OID 17134)
-- Name: thong_tin_the thong_tin_the_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.thong_tin_the
    ADD CONSTRAINT thong_tin_the_pkey PRIMARY KEY (id);


--
-- TOC entry 3587 (class 2606 OID 17138)
-- Name: thong_tin_the uk_cccd; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.thong_tin_the
    ADD CONSTRAINT uk_cccd UNIQUE (cccd);


--
-- TOC entry 3576 (class 2606 OID 17102)
-- Name: dich_vu uk_dich_vu_ten_viet_tat; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dich_vu
    ADD CONSTRAINT uk_dich_vu_ten_viet_tat UNIQUE (ten_viet_tat);


--
-- TOC entry 3589 (class 2606 OID 17136)
-- Name: thong_tin_the uk_ma_so_bhxh; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.thong_tin_the
    ADD CONSTRAINT uk_ma_so_bhxh UNIQUE (ma_so_bhxh);


--
-- TOC entry 3620 (class 2606 OID 17384)
-- Name: nguoi_dung uk_user_name; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.nguoi_dung
    ADD CONSTRAINT uk_user_name UNIQUE (user_name);


--
-- TOC entry 3572 (class 2606 OID 17283)
-- Name: dot_ke_khai unique_thang_nam_so_dot_don_vi; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai
    ADD CONSTRAINT unique_thang_nam_so_dot_don_vi UNIQUE (thang, nam, so_dot, don_vi_id);


--
-- TOC entry 3510 (class 2606 OID 16501)
-- Name: units units_code_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_code_key UNIQUE (code);


--
-- TOC entry 3512 (class 2606 OID 16503)
-- Name: units units_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


--
-- TOC entry 3518 (class 2606 OID 16505)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3520 (class 2606 OID 16507)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3541 (class 1259 OID 16884)
-- Name: idx_adjustment_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE UNIQUE INDEX idx_adjustment_code ON public.adjustment_requests USING btree (adjustment_code);


--
-- TOC entry 3542 (class 1259 OID 16878)
-- Name: idx_adjustment_requests_created_by; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_created_by ON public.adjustment_requests USING btree (created_by);


--
-- TOC entry 3543 (class 1259 OID 16883)
-- Name: idx_adjustment_requests_is_urgent; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_is_urgent ON public.adjustment_requests USING btree (is_urgent);


--
-- TOC entry 3544 (class 1259 OID 16879)
-- Name: idx_adjustment_requests_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustment_requests_status ON public.adjustment_requests USING btree (status);


--
-- TOC entry 3537 (class 1259 OID 16814)
-- Name: idx_adjustments_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustments_status ON public.adjustments USING btree (status);


--
-- TOC entry 3538 (class 1259 OID 16813)
-- Name: idx_adjustments_user_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_adjustments_user_id ON public.adjustments USING btree (user_id);


--
-- TOC entry 3625 (class 1259 OID 17770)
-- Name: idx_bien_lai_is_bhxh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_is_bhxh ON public.bien_lai USING btree (is_bhxh);


--
-- TOC entry 3626 (class 1259 OID 17769)
-- Name: idx_bien_lai_is_bhyt; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_is_bhyt ON public.bien_lai USING btree (is_bhyt);


--
-- TOC entry 3627 (class 1259 OID 17747)
-- Name: idx_bien_lai_ke_khai_bhyt_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_ke_khai_bhyt_id ON public.bien_lai USING btree (ke_khai_bhyt_id);


--
-- TOC entry 3628 (class 1259 OID 17765)
-- Name: idx_bien_lai_ma_co_quan_bhxh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_ma_co_quan_bhxh ON public.bien_lai USING btree (ma_co_quan_bhxh);


--
-- TOC entry 3629 (class 1259 OID 17749)
-- Name: idx_bien_lai_ma_nhan_vien; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_ma_nhan_vien ON public.bien_lai USING btree (ma_nhan_vien);


--
-- TOC entry 3630 (class 1259 OID 17748)
-- Name: idx_bien_lai_ma_so_bhxh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_ma_so_bhxh ON public.bien_lai USING btree (ma_so_bhxh);


--
-- TOC entry 3631 (class 1259 OID 17766)
-- Name: idx_bien_lai_ma_so_bhxh_don_vi; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_ma_so_bhxh_don_vi ON public.bien_lai USING btree (ma_so_bhxh_don_vi);


--
-- TOC entry 3632 (class 1259 OID 17751)
-- Name: idx_bien_lai_ngay_bien_lai; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_ngay_bien_lai ON public.bien_lai USING btree (ngay_bien_lai);


--
-- TOC entry 3633 (class 1259 OID 17763)
-- Name: idx_bien_lai_tinh_chat; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_bien_lai_tinh_chat ON public.bien_lai USING btree (tinh_chat);


--
-- TOC entry 3598 (class 1259 OID 17174)
-- Name: idx_cskcb_ma; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_cskcb_ma ON public.dm_cskcb USING btree (ma_tinh_kcb);


--
-- TOC entry 3599 (class 1259 OID 17173)
-- Name: idx_cskcb_value; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_cskcb_value ON public.dm_cskcb USING btree (value);


--
-- TOC entry 3581 (class 1259 OID 17606)
-- Name: idx_dai_ly_ma_tinh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dai_ly_ma_tinh ON public.dai_ly USING btree (ma_tinh);


--
-- TOC entry 3499 (class 1259 OID 16603)
-- Name: idx_declaration_batch_created_by; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_created_by ON public.declaration_batch USING btree (created_by);


--
-- TOC entry 3500 (class 1259 OID 16508)
-- Name: idx_declaration_batch_deleted_at; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_deleted_at ON public.declaration_batch USING btree (deleted_at);


--
-- TOC entry 3501 (class 1259 OID 16607)
-- Name: idx_declaration_batch_department; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_department ON public.declaration_batch USING btree (department_code);


--
-- TOC entry 3502 (class 1259 OID 16605)
-- Name: idx_declaration_batch_month_year; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_month_year ON public.declaration_batch USING btree (month, year);


--
-- TOC entry 3503 (class 1259 OID 16606)
-- Name: idx_declaration_batch_object_type; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_object_type ON public.declaration_batch USING btree (object_type);


--
-- TOC entry 3504 (class 1259 OID 16604)
-- Name: idx_declaration_batch_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declaration_batch_status ON public.declaration_batch USING btree (status);


--
-- TOC entry 3523 (class 1259 OID 16719)
-- Name: idx_declarations_bhxh_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_bhxh_code ON public.declarations USING btree (bhxh_code);


--
-- TOC entry 3524 (class 1259 OID 16721)
-- Name: idx_declarations_created_at; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_created_at ON public.declarations USING btree (created_at);


--
-- TOC entry 3525 (class 1259 OID 16760)
-- Name: idx_declarations_household_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_household_id ON public.declarations USING btree (household_id);


--
-- TOC entry 3526 (class 1259 OID 16890)
-- Name: idx_declarations_is_urgent; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_is_urgent ON public.declarations USING btree (is_urgent);


--
-- TOC entry 3527 (class 1259 OID 16720)
-- Name: idx_declarations_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_status ON public.declarations USING btree (status);


--
-- TOC entry 3528 (class 1259 OID 16732)
-- Name: idx_declarations_user_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_declarations_user_id ON public.declarations USING btree (user_id);


--
-- TOC entry 3604 (class 1259 OID 17274)
-- Name: idx_don_vi_ma_co_quan_bhxh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_don_vi_ma_co_quan_bhxh ON public.don_vi USING btree (ma_co_quan_bhxh);


--
-- TOC entry 3605 (class 1259 OID 17273)
-- Name: idx_don_vi_ma_so_bhxh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_don_vi_ma_so_bhxh ON public.don_vi USING btree (ma_so_bhxh);


--
-- TOC entry 3566 (class 1259 OID 17399)
-- Name: idx_dot_ke_khai_dai_ly; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_dai_ly ON public.dot_ke_khai USING btree (dai_ly_id);


--
-- TOC entry 3567 (class 1259 OID 17280)
-- Name: idx_dot_ke_khai_don_vi_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_don_vi_id ON public.dot_ke_khai USING btree (don_vi_id);


--
-- TOC entry 3568 (class 1259 OID 17048)
-- Name: idx_dot_ke_khai_so_dot; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_so_dot ON public.dot_ke_khai USING btree (so_dot);


--
-- TOC entry 3569 (class 1259 OID 17047)
-- Name: idx_dot_ke_khai_ten_dot; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_ten_dot ON public.dot_ke_khai USING btree (ten_dot);


--
-- TOC entry 3570 (class 1259 OID 17049)
-- Name: idx_dot_ke_khai_thang_nam; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_dot_ke_khai_thang_nam ON public.dot_ke_khai USING btree (thang, nam);


--
-- TOC entry 3558 (class 1259 OID 16998)
-- Name: idx_ds_huyen_ma_tinh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ds_huyen_ma_tinh ON public.ds_huyen USING btree (ma_tinh);


--
-- TOC entry 3553 (class 1259 OID 16970)
-- Name: idx_ds_tinh_ma; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ds_tinh_ma ON public.ds_tinh USING btree (ma);


--
-- TOC entry 3563 (class 1259 OID 17015)
-- Name: idx_ds_xa_ma_huyen; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ds_xa_ma_huyen ON public.ds_xa USING btree (ma_huyen);


--
-- TOC entry 3608 (class 1259 OID 17322)
-- Name: idx_hoa_don_dot_ke_khai_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_hoa_don_dot_ke_khai_id ON public.hoa_don_thanh_toan USING btree (dot_ke_khai_id);


--
-- TOC entry 3609 (class 1259 OID 17324)
-- Name: idx_hoa_don_ngay_thanh_toan; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_hoa_don_ngay_thanh_toan ON public.hoa_don_thanh_toan USING btree (ngay_thanh_toan);


--
-- TOC entry 3610 (class 1259 OID 17325)
-- Name: idx_hoa_don_nguoi_tao; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_hoa_don_nguoi_tao ON public.hoa_don_thanh_toan USING btree (nguoi_tao);


--
-- TOC entry 3611 (class 1259 OID 17323)
-- Name: idx_hoa_don_trang_thai; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_hoa_don_trang_thai ON public.hoa_don_thanh_toan USING btree (trang_thai);


--
-- TOC entry 3639 (class 1259 OID 17839)
-- Name: idx_ke_khai_bhxh_dot_ke_khai_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ke_khai_bhxh_dot_ke_khai_id ON public.ke_khai_bhxh USING btree (dot_ke_khai_id);


--
-- TOC entry 3640 (class 1259 OID 17842)
-- Name: idx_ke_khai_bhxh_phuong_an; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ke_khai_bhxh_phuong_an ON public.ke_khai_bhxh USING btree (phuong_an);


--
-- TOC entry 3641 (class 1259 OID 17840)
-- Name: idx_ke_khai_bhxh_thong_tin_the_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ke_khai_bhxh_thong_tin_the_id ON public.ke_khai_bhxh USING btree (thong_tin_the_id);


--
-- TOC entry 3642 (class 1259 OID 17841)
-- Name: idx_ke_khai_bhxh_trang_thai; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ke_khai_bhxh_trang_thai ON public.ke_khai_bhxh USING btree (trang_thai);


--
-- TOC entry 3590 (class 1259 OID 17161)
-- Name: idx_ke_khai_bhyt_dot_ke_khai_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ke_khai_bhyt_dot_ke_khai_id ON public.ke_khai_bhyt USING btree (dot_ke_khai_id);


--
-- TOC entry 3591 (class 1259 OID 17162)
-- Name: idx_ke_khai_bhyt_thong_tin_the_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_ke_khai_bhyt_thong_tin_the_id ON public.ke_khai_bhyt USING btree (thong_tin_the_id);


--
-- TOC entry 3614 (class 1259 OID 17388)
-- Name: idx_nguoi_dung_email; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_nguoi_dung_email ON public.nguoi_dung USING btree (email);


--
-- TOC entry 3615 (class 1259 OID 17392)
-- Name: idx_nguoi_dung_password; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_nguoi_dung_password ON public.nguoi_dung USING btree (password);


--
-- TOC entry 3616 (class 1259 OID 17387)
-- Name: idx_nguoi_dung_user_name; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_nguoi_dung_user_name ON public.nguoi_dung USING btree (user_name);


--
-- TOC entry 3635 (class 1259 OID 17720)
-- Name: idx_nguoi_thu; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_nguoi_thu ON public.quyen_bien_lai USING btree (nhan_vien_thu);


--
-- TOC entry 3545 (class 1259 OID 16960)
-- Name: idx_refresh_tokens_token; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_refresh_tokens_token ON public.refresh_tokens USING btree (token);


--
-- TOC entry 3546 (class 1259 OID 16961)
-- Name: idx_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- TOC entry 3582 (class 1259 OID 17160)
-- Name: idx_thong_tin_the_cccd; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_thong_tin_the_cccd ON public.thong_tin_the USING btree (cccd);


--
-- TOC entry 3583 (class 1259 OID 17159)
-- Name: idx_thong_tin_the_ma_so_bhxh; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_thong_tin_the_ma_so_bhxh ON public.thong_tin_the USING btree (ma_so_bhxh);


--
-- TOC entry 3636 (class 1259 OID 17721)
-- Name: idx_trang_thai; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_trang_thai ON public.quyen_bien_lai USING btree (trang_thai);


--
-- TOC entry 3507 (class 1259 OID 16518)
-- Name: idx_units_code; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_units_code ON public.units USING btree (code);


--
-- TOC entry 3508 (class 1259 OID 16519)
-- Name: idx_units_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_units_status ON public.units USING btree (status);


--
-- TOC entry 3513 (class 1259 OID 17126)
-- Name: idx_users_dai_ly_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_dai_ly_id ON public.users USING btree (dai_ly_id);


--
-- TOC entry 3514 (class 1259 OID 16520)
-- Name: idx_users_status; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_status ON public.users USING btree (status);


--
-- TOC entry 3515 (class 1259 OID 16521)
-- Name: idx_users_unit_id; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_unit_id ON public.users USING btree (unit_id);


--
-- TOC entry 3516 (class 1259 OID 16522)
-- Name: idx_users_username; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE INDEX idx_users_username ON public.users USING btree (username);


--
-- TOC entry 3634 (class 1259 OID 17695)
-- Name: ix_bien_lai_quyen_so_so_bien_lai; Type: INDEX; Schema: public; Owner: bhxh_system_user
--

CREATE UNIQUE INDEX ix_bien_lai_quyen_so_so_bien_lai ON public.bien_lai USING btree (quyen_so, so_bien_lai);


--
-- TOC entry 3695 (class 2620 OID 17843)
-- Name: ke_khai_bhxh ke_khai_bhxh_after_changes; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER ke_khai_bhxh_after_changes AFTER INSERT OR DELETE OR UPDATE ON public.ke_khai_bhxh FOR EACH ROW EXECUTE FUNCTION public.update_dot_ke_khai_total();


--
-- TOC entry 3691 (class 2620 OID 17293)
-- Name: ke_khai_bhyt ke_khai_bhyt_after_changes; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER ke_khai_bhyt_after_changes AFTER INSERT OR DELETE OR UPDATE ON public.ke_khai_bhyt FOR EACH ROW EXECUTE FUNCTION public.update_dot_ke_khai_total();


--
-- TOC entry 3687 (class 2620 OID 16524)
-- Name: declaration_batch tr_update_payment_amount_on_support_change; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER tr_update_payment_amount_on_support_change AFTER UPDATE OF support_amount ON public.declaration_batch FOR EACH ROW EXECUTE FUNCTION public.update_payment_amount_on_support_change();


--
-- TOC entry 3690 (class 2620 OID 16816)
-- Name: adjustments trigger_update_adjustments_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER trigger_update_adjustments_updated_at BEFORE UPDATE ON public.adjustments FOR EACH ROW EXECUTE FUNCTION public.update_adjustments_updated_at();


--
-- TOC entry 3693 (class 2620 OID 17327)
-- Name: hoa_don_thanh_toan trigger_update_dot_ke_khai_status; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER trigger_update_dot_ke_khai_status AFTER UPDATE ON public.hoa_don_thanh_toan FOR EACH ROW WHEN (((old.trang_thai)::text IS DISTINCT FROM (new.trang_thai)::text)) EXECUTE FUNCTION public.update_dot_ke_khai_status();


--
-- TOC entry 3692 (class 2620 OID 17297)
-- Name: ke_khai_bhyt trigger_update_tong_so_the; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER trigger_update_tong_so_the AFTER INSERT OR DELETE ON public.ke_khai_bhyt FOR EACH ROW EXECUTE FUNCTION public.update_dot_ke_khai_tong_so_the();


--
-- TOC entry 3696 (class 2620 OID 17844)
-- Name: ke_khai_bhxh trigger_update_tong_so_the_bhxh; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER trigger_update_tong_so_the_bhxh AFTER INSERT OR DELETE ON public.ke_khai_bhxh FOR EACH ROW EXECUTE FUNCTION public.update_dot_ke_khai_tong_so_the();


--
-- TOC entry 3694 (class 2620 OID 17390)
-- Name: nguoi_dung update_nguoi_dung_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER update_nguoi_dung_updated_at BEFORE UPDATE ON public.nguoi_dung FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3688 (class 2620 OID 16525)
-- Name: units update_units_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON public.units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3689 (class 2620 OID 16526)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: bhxh_system_user
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 3664 (class 2606 OID 16873)
-- Name: adjustment_requests adjustment_requests_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustment_requests
    ADD CONSTRAINT adjustment_requests_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- TOC entry 3662 (class 2606 OID 16808)
-- Name: adjustments adjustments_processed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users(id);


--
-- TOC entry 3663 (class 2606 OID 16803)
-- Name: adjustments adjustments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.adjustments
    ADD CONSTRAINT adjustments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3645 (class 2606 OID 16527)
-- Name: declaration_batch declaration_batch_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3646 (class 2606 OID 16532)
-- Name: declaration_batch declaration_batch_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3647 (class 2606 OID 16537)
-- Name: declaration_batch declaration_batch_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- TOC entry 3648 (class 2606 OID 16542)
-- Name: declaration_batch declaration_batch_payment_verified_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_payment_verified_by_fkey FOREIGN KEY (payment_verified_by) REFERENCES public.users(id);


--
-- TOC entry 3649 (class 2606 OID 16547)
-- Name: declaration_batch declaration_batch_rejected_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_rejected_by_fkey FOREIGN KEY (rejected_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3650 (class 2606 OID 16552)
-- Name: declaration_batch declaration_batch_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id);


--
-- TOC entry 3651 (class 2606 OID 16557)
-- Name: declaration_batch declaration_batch_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declaration_batch
    ADD CONSTRAINT declaration_batch_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3656 (class 2606 OID 16913)
-- Name: declarations declarations_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- TOC entry 3657 (class 2606 OID 16755)
-- Name: declarations declarations_household_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT declarations_household_id_fkey FOREIGN KEY (household_id) REFERENCES public.households(id);


--
-- TOC entry 3675 (class 2606 OID 17268)
-- Name: don_vi don_vi_dm_khoi_kcb_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.don_vi
    ADD CONSTRAINT don_vi_dm_khoi_kcb_id_fkey FOREIGN KEY (dm_khoi_kcb_id) REFERENCES public.dm_khoi_kcb(id);


--
-- TOC entry 3668 (class 2606 OID 17275)
-- Name: dot_ke_khai dot_ke_khai_don_vi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai
    ADD CONSTRAINT dot_ke_khai_don_vi_id_fkey FOREIGN KEY (don_vi_id) REFERENCES public.don_vi(id);


--
-- TOC entry 3666 (class 2606 OID 16993)
-- Name: ds_huyen ds_huyen_ma_tinh_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_huyen
    ADD CONSTRAINT ds_huyen_ma_tinh_fkey FOREIGN KEY (ma_tinh) REFERENCES public.ds_tinh(ma) ON DELETE CASCADE;


--
-- TOC entry 3667 (class 2606 OID 17010)
-- Name: ds_xa ds_xa_ma_huyen_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ds_xa
    ADD CONSTRAINT ds_xa_ma_huyen_fkey FOREIGN KEY (ma_huyen) REFERENCES public.ds_huyen(ma) ON DELETE CASCADE;


--
-- TOC entry 3682 (class 2606 OID 17742)
-- Name: bien_lai fk_bien_lai_ke_khai_bhyt; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.bien_lai
    ADD CONSTRAINT fk_bien_lai_ke_khai_bhyt FOREIGN KEY (ke_khai_bhyt_id) REFERENCES public.ke_khai_bhyt(id) ON DELETE CASCADE;


--
-- TOC entry 3680 (class 2606 OID 17585)
-- Name: dai_ly_don_vi fk_dai_ly_don_vi_dai_ly; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dai_ly_don_vi
    ADD CONSTRAINT fk_dai_ly_don_vi_dai_ly FOREIGN KEY (dai_ly_id) REFERENCES public.dai_ly(id);


--
-- TOC entry 3681 (class 2606 OID 17590)
-- Name: dai_ly_don_vi fk_dai_ly_don_vi_don_vi; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dai_ly_don_vi
    ADD CONSTRAINT fk_dai_ly_don_vi_don_vi FOREIGN KEY (don_vi_id) REFERENCES public.don_vi(id);


--
-- TOC entry 3671 (class 2606 OID 17601)
-- Name: dai_ly fk_dai_ly_tinh; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dai_ly
    ADD CONSTRAINT fk_dai_ly_tinh FOREIGN KEY (ma_tinh) REFERENCES public.ds_tinh(ma) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3658 (class 2606 OID 16722)
-- Name: declarations fk_declarations_batch; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_batch FOREIGN KEY (batch_id) REFERENCES public.declaration_batch(id) ON DELETE SET NULL;


--
-- TOC entry 3659 (class 2606 OID 16727)
-- Name: declarations fk_declarations_unit; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_unit FOREIGN KEY (unit_id) REFERENCES public.units(id) ON DELETE SET NULL;


--
-- TOC entry 3660 (class 2606 OID 16733)
-- Name: declarations fk_declarations_user; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.declarations
    ADD CONSTRAINT fk_declarations_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 3672 (class 2606 OID 17149)
-- Name: ke_khai_bhyt fk_dot_ke_khai; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhyt
    ADD CONSTRAINT fk_dot_ke_khai FOREIGN KEY (dot_ke_khai_id) REFERENCES public.dot_ke_khai(id) ON DELETE CASCADE;


--
-- TOC entry 3684 (class 2606 OID 17824)
-- Name: ke_khai_bhxh fk_dot_ke_khai_bhxh; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhxh
    ADD CONSTRAINT fk_dot_ke_khai_bhxh FOREIGN KEY (dot_ke_khai_id) REFERENCES public.dot_ke_khai(id) ON DELETE CASCADE;


--
-- TOC entry 3669 (class 2606 OID 17546)
-- Name: dot_ke_khai fk_dot_ke_khai_dai_ly; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai
    ADD CONSTRAINT fk_dot_ke_khai_dai_ly FOREIGN KEY (dai_ly_id) REFERENCES public.dai_ly(id) ON DELETE RESTRICT;


--
-- TOC entry 3670 (class 2606 OID 17103)
-- Name: dot_ke_khai fk_dot_ke_khai_dich_vu; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.dot_ke_khai
    ADD CONSTRAINT fk_dot_ke_khai_dich_vu FOREIGN KEY (dich_vu) REFERENCES public.dich_vu(ten_viet_tat);


--
-- TOC entry 3676 (class 2606 OID 17312)
-- Name: hoa_don_thanh_toan fk_hoa_don_dot_ke_khai; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.hoa_don_thanh_toan
    ADD CONSTRAINT fk_hoa_don_dot_ke_khai FOREIGN KEY (dot_ke_khai_id) REFERENCES public.dot_ke_khai(id) ON DELETE CASCADE;


--
-- TOC entry 3677 (class 2606 OID 17317)
-- Name: hoa_don_thanh_toan fk_hoa_don_nguoi_xoa; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.hoa_don_thanh_toan
    ADD CONSTRAINT fk_hoa_don_nguoi_xoa FOREIGN KEY (deleted_by) REFERENCES public.users(id);


--
-- TOC entry 3685 (class 2606 OID 17834)
-- Name: ke_khai_bhxh fk_ke_khai_bhxh_quyen_bien_lai; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhxh
    ADD CONSTRAINT fk_ke_khai_bhxh_quyen_bien_lai FOREIGN KEY (quyen_bien_lai_id) REFERENCES public.quyen_bien_lai(id);


--
-- TOC entry 3673 (class 2606 OID 17737)
-- Name: ke_khai_bhyt fk_ke_khai_bhyt_quyen_bien_lai; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhyt
    ADD CONSTRAINT fk_ke_khai_bhyt_quyen_bien_lai FOREIGN KEY (quyen_bien_lai_id) REFERENCES public.quyen_bien_lai(id);


--
-- TOC entry 3683 (class 2606 OID 17732)
-- Name: quyen_bien_lai fk_quyen_bien_lai_nhan_vien_thu; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.quyen_bien_lai
    ADD CONSTRAINT fk_quyen_bien_lai_nhan_vien_thu FOREIGN KEY (nhan_vien_thu) REFERENCES public.nguoi_dung(id) ON DELETE RESTRICT;


--
-- TOC entry 3674 (class 2606 OID 17154)
-- Name: ke_khai_bhyt fk_thong_tin_the; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhyt
    ADD CONSTRAINT fk_thong_tin_the FOREIGN KEY (thong_tin_the_id) REFERENCES public.thong_tin_the(id) ON DELETE CASCADE;


--
-- TOC entry 3686 (class 2606 OID 17829)
-- Name: ke_khai_bhxh fk_thong_tin_the_bhxh; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.ke_khai_bhxh
    ADD CONSTRAINT fk_thong_tin_the_bhxh FOREIGN KEY (thong_tin_the_id) REFERENCES public.thong_tin_the(id) ON DELETE CASCADE;


--
-- TOC entry 3661 (class 2606 OID 16785)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 3652 (class 2606 OID 16587)
-- Name: payment_bills payment_bills_batch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.declaration_batch(id);


--
-- TOC entry 3653 (class 2606 OID 16592)
-- Name: payment_bills payment_bills_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.payment_bills
    ADD CONSTRAINT payment_bills_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- TOC entry 3665 (class 2606 OID 16955)
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3678 (class 2606 OID 17359)
-- Name: thanh_toan thanh_toan_dot_ke_khai_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.thanh_toan
    ADD CONSTRAINT thanh_toan_dot_ke_khai_id_fkey FOREIGN KEY (dot_ke_khai_id) REFERENCES public.dot_ke_khai(id) ON DELETE CASCADE;


--
-- TOC entry 3679 (class 2606 OID 17364)
-- Name: thanh_toan thanh_toan_nguoi_tao_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.thanh_toan
    ADD CONSTRAINT thanh_toan_nguoi_tao_fkey FOREIGN KEY (nguoi_tao) REFERENCES public.users(username) ON DELETE CASCADE;


--
-- TOC entry 3654 (class 2606 OID 17121)
-- Name: users users_dai_ly_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_dai_ly_id_fkey FOREIGN KEY (dai_ly_id) REFERENCES public.dai_ly(id);


--
-- TOC entry 3655 (class 2606 OID 16597)
-- Name: users users_unit_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: bhxh_system_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_unit_id_fkey FOREIGN KEY (unit_id) REFERENCES public.units(id);


--
-- TOC entry 2183 (class 826 OID 16391)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON SEQUENCES TO bhxh_system_user;


--
-- TOC entry 2185 (class 826 OID 16393)
-- Name: DEFAULT PRIVILEGES FOR TYPES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TYPES TO bhxh_system_user;


--
-- TOC entry 2184 (class 826 OID 16392)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON FUNCTIONS TO bhxh_system_user;


--
-- TOC entry 2182 (class 826 OID 16390)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: -; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres GRANT ALL ON TABLES TO bhxh_system_user;


-- Completed on 2025-02-25 21:59:25

--
-- PostgreSQL database dump complete
--

