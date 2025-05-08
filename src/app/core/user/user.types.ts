export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    tenantName: string;
    tenantDescription: string | null;
    tenantCategory: string;
    tenantType: string;
    tenantLogo: {
        logo: string;
        darkModeLogo: string;
        textOnlyLogo: string;
    };
    createdAt: string;
    updatedAt: string;
    status: string; // online, away, busy, not-visible
}
