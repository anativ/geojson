package geojson

import "testing"

func P(x, y float64) Position {
	return Position{X: x, Y: y}
}

func TestPosition(t *testing.T) {
	json := string(P(1, 2).AppendJSON(nil))
	exp := `{"type":"Point","coordinates":[1,2]}`
	if json != exp {
		t.Fatalf("expected '%v', got '%v'", exp, json)
	}
	if P(1, 2) != P(1, 2).Center() {
		t.Fatalf("expected '%v', got '%v'", P(1, 2), P(1, 2).Center())
	}
}

func TestPositionPoly(t *testing.T) {
	p := P(15, 15)
	expect(t, !p.BBoxDefined())
	p.ForEachChild(func(Object) bool { panic("should not be reached") })
	expect(t, p.Contains(P(15, 15)))
	expect(t, p.Contains(R(15, 15, 15, 15)))
	expect(t, !p.Contains(R(10, 10, 15, 15)))
	expect(t, !p.Contains(P(10, 10)))
	expect(t, p.Intersects(P(15, 15)))
	expect(t, p.Intersects(R(10, 10, 20, 20)))
	expect(t, p.Intersects(
		expectJSON(t, `{"type":"Point","coordinates":[15,15,10]}`, nil),
	))
	expect(t, !p.Intersects(
		expectJSON(t, `{"type":"Point","coordinates":[9,15,10]}`, nil),
	))
	expect(t, p.Intersects(
		expectJSON(t, `{"type":"Point","coordinates":[9,15,10],"bbox":[10,10,20,20]}`, nil),
	))
	expect(t, p.Intersects(
		expectJSON(t, `{"type":"LineString","coordinates":[
			[10,10],[20,20]
		]}`, nil),
	))
	expect(t, !p.Intersects(
		expectJSON(t, `{"type":"LineString","coordinates":[
			[9,10],[20,20]
		]}`, nil),
	))
	expect(t, p.Intersects(
		expectJSON(t, `{"type":"Polygon","coordinates":[
			[[9,9],[9,21],[21,21],[21,9],[9,9]]
		]}`, nil),
	))

	expect(t, !p.Intersects(
		expectJSON(t, `{"type":"Polygon","coordinates":[
			[[9,9],[9,21],[21,21],[21,9],[9,9]],
			[[9.5,9.5],[9.5,20.5],[20.5,20.5],[20.5,9.5],[9.5,9.5]]
		]}`, nil),
	))
	expect(t, p.Intersects(
		expectJSON(t, `{"type":"Feature","geometry":
			{"type":"Point","coordinates":[15,15,10]}
		}`, nil),
	))
	expect(t, p.Intersects(
		expectJSON(t, `{"type":"Feature","geometry":
			{"type":"Polygon","coordinates":[
				[[9,9],[9,21],[21,21],[21,9],[9,9]]
			]}
		}`, nil),
	))
	expect(t, !p.Intersects(
		expectJSON(t, `{"type":"Feature","geometry":
			{"type":"Polygon","coordinates":[
				[[9,9],[9,21],[21,21],[21,9],[9,9]],
				[[9.5,9.5],[9.5,20.5],[20.5,20.5],[20.5,9.5],[9.5,9.5]]
			]}
		}`, nil),
	))
}

func TestPositionAux(t *testing.T) {
	expect(t, P(10, 10).Contains(Point{Coordinates: P(10, 10)}))
	expect(t, !P(10, 10).Contains(Point{Coordinates: P(11, 10)}))
	expect(t, P(10, 10).Contains(
		LineString{Coordinates: []Position{P(10, 10)}},
	))
	expect(t, P(10, 10).Contains(
		Polygon{Coordinates: [][]Position{{P(10, 10)}}},
	))
	expect(t, !P(10, 10).primativeContains(nil))
	expect(t, !P(10, 10).primativeIntersects(nil))
}