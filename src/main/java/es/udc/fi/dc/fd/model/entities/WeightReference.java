package es.udc.fi.dc.fd.model.entities;

public enum WeightReference {
    SMALL_CAT("Gato pequeño", 4L),
    LARGE_DOG("Perro grande", 30L),
    PERSON("Persona", 70L),
    MOTORCYCLE("Motocicleta", 200L),
    GRAND_PIANO("Piano de cola", 300L),
    HORSE("Caballo", 500L),
    SMALL_CAR("Coche pequeño", 1_200L),
    LARGE_CAR("SUV", 2_000L),
    ELEPHANT("Elefante", 4_500L),
    SCHOOL_BUS("Autobús escolar", 10_000L),
    FIRE_TRUCK("Camión de bomberos", 20_000L),
    SMALL_AIRPLANE("Avión pequeño", 40_000L),
    BLUE_WHALE("Ballena azul", 150_000L),
    BOEING_747("Boeing 747", 412_000L);

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
