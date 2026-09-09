import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { MapPin, Star, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { useLocale } from "../../i18n/useLocale";
import { listExperts } from "../../services/data/users";
import { openConversationId } from "../../lib/conversation";
import { loadGoogleMaps } from "../../lib/googleMaps";
import { formatDailyRate, initials } from "../../lib/format";
import { Screen, AppHeader, BottomNav, EmptyState, ListSkeleton } from "../../components/shared";
import type { UserAccount } from "../../types/models";

const MUNICH = { lat: 48.1351, lng: 11.582 };

export function MapView() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();
  const mapRef = useRef<HTMLDivElement>(null);
  const [experts, setExperts] = useState<UserAccount[] | null>(null);
  const [mapsAvailable, setMapsAvailable] = useState(true);

  useEffect(() => {
    listExperts()
      .then((all) => setExperts(all.filter((e) => e.expert)))
      .catch(() => setExperts([]));
  }, []);

  const located = (experts ?? []).filter((e) => e.expert?.location?.lat && e.expert?.location?.lng);

  // Initialize the map once experts + container are ready.
  useEffect(() => {
    if (!experts || !mapRef.current) return;
    let cancelled = false;
    loadGoogleMaps().then((maps) => {
      if (cancelled) return;
      if (!maps) {
        setMapsAvailable(false);
        return;
      }
      const center = located[0]?.expert?.location
        ? { lat: located[0].expert.location.lat!, lng: located[0].expert.location.lng! }
        : MUNICH;
      const map = new maps.Map(mapRef.current!, {
        center,
        zoom: 11,
        disableDefaultUI: true,
        clickableIcons: false,
      });
      located.forEach((acc) => {
        const loc = acc.expert!.location!;
        const marker = new maps.Marker({
          position: { lat: loc.lat!, lng: loc.lng! },
          map,
          title: acc.expert!.fullName,
          icon: {
            path: maps.SymbolPath.CIRCLE,
            fillColor: "#0F3B5F",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
            scale: 9,
          },
        });
        const info = new maps.InfoWindow({
          content: `<div style="font-weight:600;color:#0F3B5F">${acc.expert!.fullName}</div>`,
        });
        marker.addListener("click", () => info.open(map, marker));
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experts]);

  const handleMessage = async (acc: UserAccount) => {
    if (!user || !acc.expert) return;
    try {
      const convId = await openConversationId(user, {
        uid: acc.uid,
        displayName: acc.expert.fullName,
        role: "EXPERT",
        photoURL: acc.photoURL,
      });
      navigate(`/messaging/${convId}`);
    } catch {
      toast.error(t("errors.generic"));
    }
  };

  return (
    <Screen withBottomNav contained>
      <AppHeader title={t("map.title")} variant="hero" />

      <div className="flex-1 px-6">
        {/* Map surface */}
        {mapsAvailable ? (
          <div ref={mapRef} className="mb-5 h-56 w-full overflow-hidden rounded-2xl border border-border bg-muted" />
        ) : (
          <div className="mb-5 flex items-center gap-2 rounded-2xl border border-border bg-warning-subtle px-4 py-3 text-sm text-warning">
            <Info className="h-4 w-4 shrink-0" />
            {t("map.missingKey")}
          </div>
        )}

        <h2 className="mb-3 font-semibold text-foreground">{t("map.nearbyExperts")}</h2>

        {experts === null ? (
          <ListSkeleton />
        ) : experts.length === 0 ? (
          <EmptyState icon={MapPin} title={t("map.noLocation")} />
        ) : (
          <div className="space-y-3">
            {experts.map((acc) => {
              const e = acc.expert!;
              return (
                <button
                  key={acc.uid}
                  onClick={() => navigate(`/expert/profile/${acc.uid}`)}
                  className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start gap-3">
                    {acc.photoURL ? (
                      <img src={acc.photoURL} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                        {initials(e.fullName)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-foreground">{e.fullName}</h3>
                      <p className="truncate text-sm text-muted-foreground">{e.headline || e.background}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                        {e.location?.label && (
                          <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.location.label}</span>
                        )}
                        {e.ratingCount > 0 && (
                          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" />{e.ratingAverage.toFixed(1)}</span>
                        )}
                        <span>{formatDailyRate(e.dailyRate, locale)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        void handleMessage(acc);
                      }}
                      className="rounded-lg bg-brand-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-900"
                    >
                      {t("common.message")}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </Screen>
  );
}
