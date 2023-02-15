export default interface Gene {

    /**
     * gene mutation
     */
    Mutate(): void ;

    /**
     * cross-swap current gene and target gene
     * @param gene target gene
     */
    Chiasma(gene:Gene): Gene ;

    /**
     * Create a copy of the gene
     * @return copy of the gene
     */
    Copy(): Gene;

}