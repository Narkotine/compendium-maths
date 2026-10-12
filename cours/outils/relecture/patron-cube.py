# Vérifie si un assemblage de 6 carrés (liste de (col, ligne)) est un patron de cube, par pliage simulé.
import sys
def roll(o, d):
    # o = dict face->direction (normal vectors): on garde l'orientation du cube via 3 vecteurs (bas, nord, est)
    pass
def est_patron(cells):
    cells=set(cells); start=next(iter(cells))
    # état : position de la face posée = vecteur normal sortant du cube pour la face courante au sol,
    # on roule le cube sur le plan : orientation par (down, north, east) vecteurs 3D
    import collections
    seen={start: (0,0,-1)}  # face -> normale (dans le repère du cube)
    # orientation : matrice 3 vecteurs : down, north(+y ligne-1), east(+x)
    q=collections.deque([(start, ((0,0,-1),(0,1,0),(1,0,0)))])
    while q:
        (c,l),(dn,no,ea)=q.popleft()
        neg=lambda v: tuple(-x for x in v)
        moves={ (1,0): (ea, no, neg(dn)), (-1,0): (neg(ea), no, dn), (0,-1): (no, neg(dn), ea), (0,1): (neg(no), dn, ea)}
        for (dc,dl),(ndn,nno,nea) in moves.items():
            n=(c+dc,l+dl)
            if n in cells and n not in seen:
                seen[n]=ndn; q.append((n,(ndn,nno,nea)))
    return len(seen)==6 and len(set(seen.values()))==6
nets={"A":[(0,0),(1,0),(2,0),(1,1),(1,2),(1,3)],"B":[(0,0),(1,0),(2,0),(0,1),(1,1),(2,1)],"C":[(0,0),(1,0),(1,1),(2,1),(3,1),(3,2)],
"D":[(0,0),(1,0),(2,0),(3,0),(4,0),(2,1)],"E":[(0,0),(0,1),(1,1),(2,1),(3,1),(3,2)],"F":[(0,0),(0,1),(1,1),(2,1),(3,1),(2,2)]}
for k,v in nets.items(): print(k, est_patron(v))
