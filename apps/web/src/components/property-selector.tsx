import type { PropertyCode, PropertySummary } from "@tps/types";

interface PropertySelectorProps {
  properties: PropertySummary[];
  selectedProperty: PropertyCode;
  onChange: (property: PropertyCode) => void;
}

export function PropertySelector({
  properties,
  selectedProperty,
  onChange
}: PropertySelectorProps) {
  return (
    <label className="property-selector">
      <span className="eyebrow">Railroad</span>
      <select
        value={selectedProperty}
        onChange={(event) => onChange(event.target.value as PropertyCode)}
      >
        {properties.map((property) => (
          <option key={property.code} value={property.code}>
            {property.name}
          </option>
        ))}
      </select>
    </label>
  );
}
