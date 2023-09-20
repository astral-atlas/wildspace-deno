// @ts-ignore plz
export const starRoomParticles = import.meta.glob(
  "./star_room_particles/*.PNG",
  { eager: true, import: "default" },
);

export const starRoomParticleNames = Object.keys(starRoomParticles);
