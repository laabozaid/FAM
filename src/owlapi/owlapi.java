package owlapi;

import java.io.IOException;
import java.io.File;
import java.net.URLDecoder;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.semanticweb.owlapi.apibinding.OWLManager;
import org.semanticweb.owlapi.io.*;
import org.semanticweb.owlapi.model.*;
import org.semanticweb.owlapi.util.DefaultPrefixManager;
import org.semanticweb.owlapi.util.OWLEntityRenamer;

import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

@WebServlet("/owlapi")
public class owlapi extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private static OWLOntology 		  localOntology;
	private static OWLOntologyManager manager;
	private static OWLDataFactory     factory;
	private static PrefixManager 	  pm 			= new DefaultPrefixManager("http://wise.vub.ac.be/Members/lamia/variability/Feature_Assembly/FAM.owl#");
   
	private enum Methods {ADDIN, ADDOP, ADDDP, REMOP, REMDP, RENIN;}
	
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {        
        String method = request.getParameter("method").toString();
        String [] param = request.getParameter("param").split("-");
        response.setContentType("text/html;charset=UTF-8");

        String path = owlapi.class.getProtectionDomain().getCodeSource().getLocation().getPath();
        String decodedPath = URLDecoder.decode(path.replace("WEB-INF/classes/owlapi/owlapi.class", ""), "UTF-8");
        
        initialize(decodedPath + "/" + param[0]);
        switch (Methods.valueOf(method)) {
    		case ADDIN: addInstance(param[1], param[2]); break;
        	case ADDOP: addObjectproperty(param[1], param[2], param[3]); break;
        	case ADDDP: if (param[3].equalsIgnoreCase("true") || param[3].equalsIgnoreCase("false"))
    						addDataproperty(param[1], param[2], Boolean.valueOf(param[3]));
						else addDataproperty(param[1], param[2], param[3]); break;
        	case REMOP: removeObjectproperties(param[1], param[2]); break;
        	case REMDP: removeDataproperties(param[1], param[2]); break;
        	case RENIN: renameInstance(param[1], param[2]);
        }
        saveOntology();
	}
   
   public void initialize(String directory) {
	   manager = OWLManager.createOWLOntologyManager();
       File file = new File(directory);
		//IRI iri = IRI.create(directory);
		try {
			localOntology = manager.loadOntologyFromOntologyDocument(file);
			System.out.println("Loaded ontology: " + localOntology);
           factory = manager.getOWLDataFactory();
           }	
		catch (UnparsableOntologyException e) {
           System.out.println("Could not parse the ontology: " + e.getMessage());
           Map<OWLParser, OWLParserException> exceptions = e.getExceptions();
           for (OWLParser parser : exceptions.keySet()) {
               System.out.println("Tried to parse the ontology with the " + parser.getClass().getSimpleName() + " parser");
               System.out.println("Failed because: " + exceptions.get(parser).getMessage());
           }
       }
       catch (UnloadableImportException e) {
           System.out.println("Could not load import: " + e.getImportsDeclaration());
           OWLOntologyCreationException cause = e.getOntologyCreationException();
           System.out.println("Reason: " + cause.getMessage());
       }
       catch (OWLOntologyCreationException e) {
           System.out.println("Could not load ontology: " + e.getMessage());
       }	
	}
   
   public void addInstance(String Class, String individual) {
	    OWLClass owlClass = factory.getOWLClass(Class, pm);
        OWLClass superClass = factory.getOWLThing();
        OWLIndividual instance = factory.getOWLNamedIndividual(individual, pm);
		
		OWLClassAssertionAxiom classAssertion1 = factory.getOWLClassAssertionAxiom(superClass, instance);
		manager.addAxiom(localOntology, classAssertion1);
		OWLClassAssertionAxiom classAssertion2 = factory.getOWLClassAssertionAxiom(owlClass, instance);
		manager.addAxiom(localOntology, classAssertion2);
		System.out.println("Instance added");
	}
	
	public void addObjectproperty(String individual, String Property, String value) {
		OWLIndividual instance1 = factory.getOWLNamedIndividual(individual, pm);
		OWLIndividual instance2 = factory.getOWLNamedIndividual(value, pm);
		OWLObjectProperty property = factory.getOWLObjectProperty(Property, pm);	
		OWLObjectPropertyAssertionAxiom propertyAssertion = factory.getOWLObjectPropertyAssertionAxiom(property, instance1, instance2);
		
		manager.addAxiom(localOntology, propertyAssertion);
		System.out.println("Object property added");
	}
	
	public void addDataproperty(String individual, String Property, String data) {
		addDataproperty(individual, Property, factory.getOWLLiteral(data));
	}
	
	public void addDataproperty(String individual, String Property, boolean data) {
		addDataproperty(individual, Property, factory.getOWLLiteral(data));
	}
	
	public void addDataproperty(String individual, String Property, OWLLiteral literal) {
		OWLIndividual instance = factory.getOWLNamedIndividual(individual, pm);
		OWLDataPropertyExpression property = factory.getOWLDataProperty(Property, pm);
		OWLDataPropertyAssertionAxiom propertyAssertion = factory.getOWLDataPropertyAssertionAxiom(property, instance, literal);
		
		manager.addAxiom(localOntology, propertyAssertion);
		System.out.println("Data property added");
	}
	
	public void removeObjectproperties(String Individual, String Property) {
		OWLIndividual individual = factory.getOWLNamedIndividual(Individual, pm);
		OWLObjectPropertyExpression property = factory.getOWLObjectProperty(Property, pm);		
		Set<OWLIndividual> propertyValues = individual.getObjectPropertyValues(property, localOntology);
		Iterator<OWLIndividual> it = propertyValues.iterator();
		
		while (it.hasNext()) {
			OWLObjectPropertyAssertionAxiom propertyAssertion = factory.getOWLObjectPropertyAssertionAxiom(property, individual, it.next());
			manager.removeAxiom(localOntology, propertyAssertion);
		}
		System.out.println("Properties deleted");
	}

	public void removeDataproperties(String Individual, String Property) {
		OWLIndividual individual = factory.getOWLNamedIndividual(Individual, pm);
		OWLDataPropertyExpression property = factory.getOWLDataProperty(Property, pm);		
		Set<OWLLiteral> propertyValues = individual.getDataPropertyValues(property, localOntology);
		Iterator<OWLLiteral> it = propertyValues.iterator();
		
		while (it.hasNext()) {
			OWLDataPropertyAssertionAxiom propertyAssertion = factory.getOWLDataPropertyAssertionAxiom(property, individual, it.next());
			manager.removeAxiom(localOntology, propertyAssertion);
		}
		System.out.println("Data deleted");
	}
	
	public void renameInstance(String individual, String name) {
		OWLEntity instance = factory.getOWLNamedIndividual(individual, pm);
		OWLEntityRenamer renamer = new OWLEntityRenamer(manager, Collections.singleton(localOntology));
		
		List<OWLOntologyChange> rename = renamer.changeIRI(instance, IRI.create(name));
		manager.applyChanges(rename);
		System.out.println("Instance renamed");
	}
	
	public void saveOntology(){
       try{
       	manager.saveOntology(localOntology);
       	System.out.println("Saved ontology: " + localOntology);
       } catch (OWLOntologyStorageException e) {
           e.printStackTrace();
       }
	}
}
