from rest_framework import serializers
from .models import Subject

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = "__all__"
        read_only_fields = ("user", "created_at")

    def validate(self, attrs):
        scale = attrs.get("scale_type", "5")
        grade = str(attrs.get("grade", "")).strip()

        if scale == "5" and grade not in ["5", "4", "3", "2"]:
            raise serializers.ValidationError({"grade": "5 ballik shkalada baho 2, 3, 4 yoki 5 bo'lishi kerak."})
        elif scale == "4" and grade not in ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"]:
            raise serializers.ValidationError({"grade": "4.0 shkalada baho A+, A, A-, B+... bo'lishi kerak."})
        elif scale == "ects" and grade not in ["ECTS_A", "ECTS_B", "ECTS_C", "ECTS_D", "ECTS_E", "ECTS_FX", "ECTS_F"]:
            raise serializers.ValidationError({"grade": "ECTS shkalasida baho A, B, C, D, E, FX, F bo'lishi kerak."})
        elif scale == "100":
            try:
                val = float(grade)
                if not (0 <= val <= 100):
                    raise ValueError()
            except (ValueError, TypeError):
                raise serializers.ValidationError({"grade": "100 ballik shkalada baho 0-100 oralig'ida bo'lishi kerak."})
        return attrs