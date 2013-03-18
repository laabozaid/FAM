package com.assembler;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.hp.hpl.jena.ontology.*;
import com.hp.hpl.jena.rdf.model.*;
import com.hp.hpl.jena.util.*;
import com.hp.hpl.jena.shared.*;
import com.hp.hpl.jena.util.iterator.*;
import com.hp.hpl.jena.query.*;
import com.hp.hpl.jena.db.IDBConnection;
import com.hp.hpl.jena.graph.*;
import com.hp.hpl.jena.reasoner.rulesys.*;
import com.hp.hpl.jena.reasoner.*;

import java.sql.Connection;
import java.sql.DriverManager;
import java.util.Iterator;

 /**
 * Servlet implementation class configurator
 */
@WebServlet("/configurator")
public class configurator extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
    /**
     * @see HttpServlet#HttpServlet()
     */
    public configurator() {
        super();
        // TODO Auto-generated constructor stub

			
        
     /*   
        OntModel lmodel;
    	String className = "com.mysql.jdbc.Driver";         // path of driver class
		try {
			Class.forName (className);                          // Load the Driver
		} catch (Exception e) { e.printStackTrace();}
		String DB_URL =     "jdbc:mysql://localhost/featureassembly";  // URL of database 
		String DB_USER =   "featureassembly";                          // database user id
		String DB_PASSWD = "admin";                          // database password
		String DB =        "MySQL";                         // database type

		//com.hp.hpl.jena.db.IDBConnection connection = new com.hp.hpl.jena.db.DBConnection ( DB_URL, DB_USER, DB_PASSWD, DB );

		IDBConnection connection= ModelFactory.createSimpleRDBConnection( DB_URL, DB_USER, DB_PASSWD, DB );
		ModelMaker m = ModelFactory.createModelRDBMaker(connection);
		*/
    }

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		// TODO Auto-generated method stub
		
		response.getWriter().println("ummm !!");
        //load the ontology contents into a jena model
	     // Instantiate the MySQL driver
	        
	      //  OntModel FAOntology=ModelFactory.createOntologyModel(OntModelSpec.OWL_DL_MEM_RDFS_INF);
	        
		//String Ont_NS="http://wise.vub.ac.be/Members/lamia/variability/Feature_Assembly/FAM.owl#";
	        
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
