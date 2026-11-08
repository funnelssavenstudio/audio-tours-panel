import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useEffect, ComponentType } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

const withAuth = <P extends object>(
  Component: ComponentType<P>,
  allowedRoles: string[]
) => {
  const WithAuthComponent = (props: P) => {
    const router = useRouter();
    const { data: session, status } = useSession() as {
      data: Session;
      status: "loading" | "authenticated";
    };

    useEffect(() => {
      if (status === "loading") return;
      const userRoles = session?.user?.roles ?? [];
      const hasAllowedRole = userRoles.some((role) =>
        allowedRoles.includes(role)
      );

      if (!session || !hasAllowedRole) {
        router.push("/access-denied");
      }
    }, [allowedRoles, router, session, status]);

    const userRoles = session?.user?.roles ?? [];
    const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role));

    if (session && hasAllowedRole) {
      return <Component {...props} />;
    }

    return null;
  };

  WithAuthComponent.displayName = `WithAuth(${
    Component.displayName || Component.name
  })`;

  return WithAuthComponent;
};

export default withAuth;
