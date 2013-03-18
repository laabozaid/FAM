package com.assembler;

import java.io.IOException;
import java.util.Iterator;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hp.hpl.jena.ontology.OntClass;
import com.hp.hpl.jena.ontology.OntModel;
import com.hp.hpl.jena.ontology.OntModelSpec;
import com.hp.hpl.jena.rdf.model.ModelFactory;

/**
 * Servlet implementation class test
 */
@WebServlet("/test")
public class test extends HttpServlet {
	private static final long serialVersionUID = 1L;

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		
		OntModel model =	ModelFactory.createOntologyModel(OntModelSpec.OWL_MEM, null);
    	model.read("scripts/loader/feature_pool.owl");
    	OntClass opus = model.getOntClass ("http://wise.vub.ac.be/Members/lamia/variability/Feature_Assembly/FAM.owl#Feature");
    	for (Iterator <?> bs = opus.listInstances(); bs.hasNext(); ) {
    		response.getWriter().println("instance " + bs.next().toString());
    	}

		response.getWriter().println("the ontology finished displaying  !!");
		
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
	}

}
