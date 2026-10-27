// product & payment
export interface Product {
    id: string;
    title: string;
    images?: string;
    logo?: string;
    selling_price: number;
    selling_price_gold: number;
    selling_price_platinum: number;
    selling_price_reseller: number;
    status?: number;
}

export type PaymentMethod = {
    id: string;
    name: string;
    images: string;
    code: string;
    payment_id: string;
    minimum_amount: number;
    maximum_amount: number;
    fee: number;
    fee_percent: number;
    totalPrice: number;
    type: string;
    status: string;
    group: string;
    total_price?: number;
    is_deposit?: boolean;
    account_name?: string;
    account_number?: string;
    manual_qris?: string;
};

type PaymentInstruction = {
    title: string;
    steps: string[];
};

// transaction
export interface Transaction {
    order_id: string;
    games: string;
    product: string;
    id_games: string;
    server_games?: string | null;
    nickname?: string | null;
    price: number;
    fee: number;
    discount_price?: number | null;
    discount_voucher: number;
    code_voucher: string | null;
    promo_price: number;
    total_price: number;
    payment_name: string;
    payment_method: string;
    payment_code: string;
    payment_status: string;
    payment_instructions?: PaymentInstruction[];
    buy_status: string;
    serial_number: string;
    expired_time: number;
    created_at: string;
    updated_at?: string;
    order_inputs?: Record<string, string> | null;
    email?: string | null;
    quantity: number;
}

// summary
export type SummaryData = {
    total: number;
    pending: number;
    proses: number;
    sukses: number;
    gagal: number;
} & Record<string, number>;

export interface Region {
    active?: string;
    currency?: string;
    exchange_rate?: number;
    languages?: string[];
    data?: Array<{
        code: string;
        name: string;
        currency: string;
        flag?: string;
        language?: string[];
    }>;
}




export interface Settings {
    success?: boolean;
    data: {
        theme?: ThemeSettings;
        maintenance?: {
            isMaintenance?: boolean
            message?: string
        };
        general?: {
            title?: string;
            logo?: string;
            favicon?: string;
            image_product?: string;
            image_flashsale?: string;
            image_popular?: string;
            footer_banner?: string;
            background_title?: string;
            banner?: string;
            banner_game?: string;
            coin_image?: string;
            popular_icon?: string;
            popular_title_id?: string;
            popular_title_en?: string;
            popular_subtitle_id?: string;
            popular_subtitle_en?: string;
            popular_style?: "0" | "1" | "2";
            ui_effect?: "0" | "1" | "2";
            game_list_style?: "0" | "1" | "2";
            show_leaderboard?: "0" | "1";
            show_last_transactions?: "0" | "1";
            product_variant_style?: "0" | "1";
            show_category_all?: "0" | "1";
        };
        seo?: {
            title?: string;
            description_id?: string;
            description_en?: string;
            keywords_id?: string;
            keywords_en?: string;
            gtm_id?: string;
            ga4_id?: string;              // NEW
            meta_pixel_id?: string;       // NEW
            gsc_verification?: string;    // NEW

        };
        sosmed?: {
            fb?: string;
            ig?: string;
            wa?: string;
            x?: string;
            yt?: string;
            tt?: string;
            email?: string;
        };



        region?: Region;
        contact?: {
            button_type?: "image" | "icon";
            button_text?: string;
            button_icon?: "headset" | "chat" | "message-circle";

            main_icon?: string | null;
            list?: FloatingContactItem[];
        };
        [key: string]: any;

    };
}

export interface FloatingContactItem {
    title: string;
    url: string;
}
// voucher
export interface Voucher {
    id: number;
    code: string;
    type: "percentage" | "fixed";
    amount: number;
    max_discount?: number | null;
    min_amount?: number | null;
    usage_limit?: number | null;
    used?: number;
    max_daily_usage?: number | null;
    max_usage_per_id?: number | null;
    max_usage_per_ip?: number | null;
    max_usage_per_device?: number | null;
    note?: string | null;
    expires_at?: string | null;
    is_active?: boolean;
    game_id?: number | null;
    allowed_roles?: string[];
    available?: boolean;
    last_used_id_game?: string | null;
    last_used_server_game?: string | null;
}

export interface VoucherLog {
    id: number;
    voucher_id: number;
    user_id?: number | null;
    order_id?: number | null;
    discount?: number;
    ip?: string;
    device?: string;
    created_at: string;
    id_games?: string | null;
    server_games?: string | null;
}

export type ThemeMode = "system" | "light" | "dark";

export interface ThemeGradient {
    active?: boolean;
    dir?: string;

    from?: {
        color?: string;
        stop?: number;
    };

    via?: {
        color?: string;
        stop?: number;
    };

    to?: {
        color?: string;
        stop?: number;
    };
}

export interface ThemeRoot {
    background?: string;
    foreground?: string;

    card?: string;
    card_foreground?: string;

    popover?: string;
    popover_foreground?: string;

    primary?: string;
    primary_foreground?: string;

    secondary?: string;
    secondary_foreground?: string;

    muted?: string;
    muted_foreground?: string;

    accent?: string;
    accent_foreground?: string;

    destructive?: string;
    destructive_foreground?: string;

    border?: string;
    input?: string;
    ring?: string;

    radius?: string;
}

export interface ThemeSettings {

    default?: ThemeMode;
    root?: ThemeRoot;
    dark?: ThemeRoot;
    gradient?: ThemeGradient;
}