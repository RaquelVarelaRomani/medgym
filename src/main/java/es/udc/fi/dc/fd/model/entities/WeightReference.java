package es.udc.fi.dc.fd.model.entities;

public enum WeightReference {
    SMALL_CAT("gato pequeño", 4L),
    LARGE_DOG("perro grande", 30L),
    PERSON("persona", 70L),
    MOTORCYCLE("motocicleta", 200L),
    GRAND_PIANO("piano de cola", 300L),
    HORSE("caballo", 500L),
    SMALL_CAR("coche pequeño", 1_200L),
    LARGE_CAR("SUV", 2_000L),
    ELEPHANT("elefante", 4_500L),
    SCHOOL_BUS("autobús escolar", 10_000L),
    FIRE_TRUCK("camión de bomberos", 20_000L),
    SMALL_AIRPLANE("avión pequeño", 40_000L),
    BLUE_WHALE("ballena azul", 150_000L),
    BOEING_747("boeing 747", 412_000L);

    private final String name;
    private final Long weightKg;

    WeightReference(String name, Long weightKg) {
        this.name = name;
        this.weightKg = weightKg;
    }

    public String getName() {
        return name;
    }

    public Long getWeightKg() {
        return weightKg;
    }

    public static WeightReference findBestMatch(Long targetWeightKg) {
        if (targetWeightKg == null || targetWeightKg <= 0) {
            return SMALL_CAT;
        }

        WeightReference bestMatch = SMALL_CAT;
        for (WeightReference ref : values()) {
            if (ref.weightKg <= targetWeightKg) {
                bestMatch = ref;
            } else {
                break;
            }
        }

        return bestMatch;
    }

    public static double calculateRatio(Long targetWeightKg, WeightReference reference) {
        if (targetWeightKg == null || targetWeightKg <= 0 || reference == null) {
            return 0.0;
        }
        return (double) targetWeightKg / reference.getWeightKg();
    }
}
