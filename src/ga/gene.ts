export default interface Gene {

    Mutate(): void ;

    Chiasma(gene:Gene): Gene ;

    Copy(): Gene;

}